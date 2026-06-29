import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS, ADMIN_NAV_ITEMS } from '../../utils/constants';
import { DonationStatus, Donation, Expense } from '../../types';
import { ReceiptView } from './ReceiptView';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { 
  Check, 
  X, 
  Trash2, 
  DollarSign, 
  Clock, 
  FileText,
  CheckCircle2,
  Cloud,
  LayoutGrid,
  Phone,
  LogOut,
  Plus,
  Lock,
  Info,
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  AlertCircle,
  PiggyBank,
  Eye,
  Edit2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    lang, 
    donations, 
    expenses = [], 
    addExpense, 
    deleteExpense, 
    settings, 
    updateDonation, 
    deleteDonation, 
    addDonation, 
    logout, 
    isAdmin, 
    login,
    loginWithGoogle, 
    authLoading,
    loadingDonations,
    loadingExpenses
  } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[lang];
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dashboard primary view toggle: 'donations' list vs 'expenses' (Financial Ledger)
  const [dashboardView, setDashboardView] = useState<'donations' | 'expenses'>(
    location.pathname === '/admin/expenses' ? 'expenses' : 'donations'
  );

  React.useEffect(() => {
    console.log("[DEBUG] AdminDashboard: Pathname is", location.pathname);
    if (location.pathname === '/admin/expenses') {
      setDashboardView('expenses');
      const element = document.getElementById('ledger-workspace');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else if (location.pathname === '/admin/donations') {
      setDashboardView('donations');
      const element = document.getElementById('ledger-workspace');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      setDashboardView('donations');
    }
  }, [location.pathname]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [viewingReceipt, setViewingReceipt] = useState<Donation | null>(null);
  const [selectedDonationDetails, setSelectedDonationDetails] = useState<Donation | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState<Donation | null>(null);
  const [showCashForm, setShowCashForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  
  const [editingDonationId, setEditingDonationId] = useState<string | null>(null);
  const [cashFormData, setCashFormData] = useState({ 
    donorName: '', 
    amount: '', 
    purpose: t.categories?.[0] || 'General Welfare',
    phone: '',
    email: '',
    paymentMethod: 'Cash',
    transactionId: '',
    status: DonationStatus.APPROVED
  });

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseFormData, setExpenseFormData] = useState({
    amount: '',
    category: 'Education',
    descriptionEn: '',
    descriptionBn: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(null);
  const [deleteConfirmationWord, setDeleteConfirmationWord] = useState('');

  const pendingDonations = donations.filter(d => d.status === DonationStatus.PENDING);
  const approvedDonations = donations.filter(d => d.status === DonationStatus.APPROVED);
  const rejectedDonations = donations.filter(d => d.status === DonationStatus.REJECTED);
  const donationTotal = approvedDonations.reduce((sum, d) => sum + d.amount, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = donationTotal - expenseTotal;

  // Donation lists filtration
  const query = searchQuery.trim().toLowerCase();
  const filterDonations = (list: Donation[]) => {
    if (!query) return list;
    return list.filter(d => {
      const donorName = d.isAnonymous ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : (d.donorName || '');
      const phone = d.phone || '';
      const txId = d.transactionId || '';
      const paymentMethod = d.paymentMethod || '';
      return (
        donorName.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query) ||
        txId.toLowerCase().includes(query) ||
        paymentMethod.toLowerCase().includes(query)
      );
    });
  };

  const filteredPending = filterDonations(pendingDonations);
  const filteredApproved = filterDonations(approvedDonations);
  const filteredRejected = filterDonations(rejectedDonations);

  // Expense list filtration
  const expQuery = expenseSearchQuery.trim().toLowerCase();
  const filteredExpenses = expenses.filter(e => {
    if (!expQuery) return true;
    const cat = e.category || '';
    const descEn = e.descriptionEn || '';
    const descBn = e.descriptionBn || '';
    return (
      cat.toLowerCase().includes(expQuery) ||
      descEn.toLowerCase().includes(expQuery) ||
      descBn.toLowerCase().includes(expQuery)
    );
  });

  // Calculate dynamic statistics
  const stats = [
    { 
      icon: <TrendingUp size={24}/>, 
      label: lang === 'bn' ? 'মোট তহবিল প্রাপ্তি (আয়)' : 'Total Income (Donations)', 
      val: `৳${donationTotal.toLocaleString()}`, 
      color: 'emerald' 
    },
    { 
      icon: <TrendingDown size={24}/>, 
      label: lang === 'bn' ? 'মোট সামাজিক ব্যয়' : 'Total Expenses', 
      val: `৳${expenseTotal.toLocaleString()}`, 
      color: 'rose' 
    },
    { 
      icon: <PiggyBank size={24}/>, 
      label: lang === 'bn' ? 'নীট উদ্বৃত্ত (তহবিল)' : 'Net Balance', 
      val: `৳${netBalance.toLocaleString()}`, 
      color: netBalance >= 0 ? 'blue' : 'rose' 
    },
    { 
      icon: <Clock size={24}/>, 
      label: lang === 'bn' ? 'অপেক্ষমান অনুদান' : 'Pending Approvals', 
      val: pendingDonations.length, 
      color: 'amber' 
    }
  ];

  // Helper groupings: Monthly Financial calculations
  const getMonthlyFinancials = () => {
    const months: { [key: string]: { income: number; expense: number } } = {};
    
    // Group Income
    approvedDonations.forEach(d => {
      const key = d.date ? d.date.substring(0, 7) : new Date().toISOString().substring(0, 7); // YYYY-MM
      if (!months[key]) months[key] = { income: 0, expense: 0 };
      months[key].income += d.amount;
    });

    // Group Expenses
    expenses.forEach(e => {
      const key = e.date ? e.date.substring(0, 7) : new Date().toISOString().substring(0, 7);
      if (!months[key]) months[key] = { income: 0, expense: 0 };
      months[key].expense += e.amount;
    });

    return Object.entries(months).sort((a,b) => b[0].localeCompare(a[0])); // Newest month first
  };

  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDonationId) {
      const existing = donations.find(d => d.id === editingDonationId);
      const donationData: Donation = {
        ...existing!,
        donorName: cashFormData.donorName,
        isAnonymous: !cashFormData.donorName,
        amount: Number(cashFormData.amount),
        phone: cashFormData.phone || existing?.phone || 'N/A',
        email: cashFormData.email || existing?.email || '',
        purpose: cashFormData.purpose,
        paymentMethod: cashFormData.paymentMethod || existing?.paymentMethod || 'Cash',
        transactionId: cashFormData.transactionId || existing?.transactionId || `CASH-${Date.now()}`,
        status: cashFormData.status || existing?.status || DonationStatus.APPROVED
      };
      addDonation(donationData).then(() => {
        alert(lang === 'bn' ? 'অনুদান সফলভাবে আপডেট করা হয়েছে!' : 'Donation updated successfully!');
      }).catch((err) => {
        alert(lang === 'bn' ? 'অনুদান আপডেট করতে সমস্যা হয়েছে।' : 'Error updating donation.');
      });
    } else {
      const donationData: Donation = {
        donorName: cashFormData.donorName,
        isAnonymous: !cashFormData.donorName,
        amount: Number(cashFormData.amount),
        phone: cashFormData.phone || 'N/A (Cash)',
        email: cashFormData.email || '',
        transactionId: cashFormData.transactionId || `CASH-${Date.now()}`,
        purpose: cashFormData.purpose,
        paymentMethod: cashFormData.paymentMethod || 'Cash',
        date: new Date().toISOString(),
        id: Date.now().toString(),
        status: cashFormData.status || DonationStatus.APPROVED
      };
      addDonation(donationData).then(() => {
        alert(lang === 'bn' ? 'নগদ অনুদান ডাটাবেজে সফলভাবে যুক্ত হয়েছে!' : 'Cash donation successfully recorded in the database!');
      }).catch((err) => {
        alert(lang === 'bn' ? 'অনুদান যুক্ত করতে সমস্যা হয়েছে।' : 'Error adding donation to the database.');
      });
    }
    
    setCashFormData({
      donorName: '',
      amount: '',
      purpose: t.categories?.[0] || 'General Welfare',
      phone: '',
      email: '',
      paymentMethod: 'Cash',
      transactionId: '',
      status: DonationStatus.APPROVED
    });
    setEditingDonationId(null);
    setShowCashForm(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseId = editingExpenseId || `exp_${Date.now()}`;
    const expenseData: Expense = {
      id: expenseId,
      amount: Number(expenseFormData.amount),
      category: expenseFormData.category,
      descriptionEn: expenseFormData.descriptionEn,
      descriptionBn: expenseFormData.descriptionBn,
      date: expenseFormData.date
    };
    addExpense(expenseData).then(() => {
      alert(editingExpenseId 
        ? (lang === 'bn' ? 'ব্যয়ের হিসাব সফলভাবে আপডেট হয়েছে!' : 'Expense updated successfully!')
        : (lang === 'bn' ? 'ব্যয়ের হিসাব সফলভাবে সংরক্ষিত হয়েছে!' : 'Expense recorded successfully!')
      );
    }).catch((err) => {
      alert(lang === 'bn' ? 'ব্যয় সংরক্ষণে ব্যর্থ হয়েছে।' : 'Error saving expense.');
    });
    setExpenseFormData({
      amount: '',
      category: 'Education',
      descriptionEn: '',
      descriptionBn: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingExpenseId(null);
    setShowExpenseForm(false);
  };

  const handleEditDonation = (d: Donation) => {
    setEditingDonationId(d.id);
    setCashFormData({
      donorName: d.donorName || '',
      amount: String(d.amount),
      purpose: d.purpose,
      phone: d.phone || '',
      email: d.email || '',
      paymentMethod: d.paymentMethod || 'Cash',
      transactionId: d.transactionId || '',
      status: d.status
    });
    setShowCashForm(true);
  };

  const handleEditExpense = (e: Expense) => {
    setEditingExpenseId(e.id);
    setExpenseFormData({
      amount: String(e.amount),
      category: e.category,
      descriptionEn: e.descriptionEn,
      descriptionBn: e.descriptionBn,
      date: e.date
    });
    setShowExpenseForm(true);
  };

  const handleCloseDonationForm = () => {
    setShowCashForm(false);
    setEditingDonationId(null);
    setCashFormData({
      donorName: '',
      amount: '',
      purpose: t.categories?.[0] || 'General Welfare',
      phone: '',
      email: '',
      paymentMethod: 'Cash',
      transactionId: '',
      status: DonationStatus.APPROVED
    });
  };

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpenseId(null);
    setExpenseFormData({
      amount: '',
      category: 'Education',
      descriptionEn: '',
      descriptionBn: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getStatColors = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
      case 'rose': return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';
      case 'blue': return 'bg-blue-50 dark:bg-slate-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30';
      case 'amber': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
      default: return 'bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400';
    }
  };

  const superAdminEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || 'pavel4mutiara@gmail.com';

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{lang === 'bn' ? 'অপেক্ষা করুন...' : 'Authenticating admin...'}</p>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password.trim()) {
      setErrorMsg(lang === 'bn' ? 'ইউজারনেম এবং পাসওয়ার্ড দুটিই প্রয়োজন!' : 'Both Username and Password are required!');
      return;
    }
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (!success) {
      setErrorMsg(lang === 'bn' ? 'ভুল ইউজারনেম অথবা পাসওয়ার্ড!' : 'Incorrect username or password!');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden my-12 bengali z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full"></div>
        <div className="w-20 h-20 bg-emerald-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-slate-800 shadow-inner rotate-3">
          <Lock size={36} />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {lang === 'bn' ? 'প্রশাসক লগইন' : 'Admin Gateway'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs max-w-xs mx-auto leading-relaxed">
            {lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংঘের পোর্টাল পরিচালনা করতে লগইন করুন।' : 'Access restricted to authorized personnel only. Please verify your credentials.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'bn' ? 'ইমেল অথবা ইউজারনেম' : 'Email / Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={lang === 'bn' ? 'যেমন: admin@azadi.org' : 'e.g., admin@azadi.org'}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === 'bn' ? 'পাসওয়ার্ড দিন' : 'Enter password'}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-black text-red-500 text-center">
              ⚠️ {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              lang === 'bn' ? 'লগইন করুন' : 'Login'
            )}
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-slate-100 dark:bg-slate-800"></span>
            <span className="relative bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 capitalize">
              {lang === 'bn' ? 'অথবা' : 'or'}
            </span>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 font-bold py-4 rounded-xl focus:ring-2 focus:ring-slate-400 outline-none transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
            </svg>
            {lang === 'bn' ? 'গুগল দিয়ে লগইন করুন' : 'Sign in with Google'}
          </button>
        </form>
      </div>
    );
  }

  if (viewingReceipt) {
    return (
      <ReceiptView 
        donation={viewingReceipt} 
        settings={settings} 
        onBack={() => setViewingReceipt(null)} 
      />
    );
  }

  // Monthly breakdown dataset
  const monthlyList = getMonthlyFinancials();

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 bengali">
      
      {/* Firebase Sync Mode Status Bar */}
      <div className="rounded-4xl p-0.5 border-2 bg-emerald-500/10 border-emerald-500/30 print:hidden">
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-4xl p-5 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-600 text-white shrink-0">
              <Cloud size={24} className="animate-pulse" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-center md:justify-start gap-3">
                {lang === 'bn' ? 'ফায়ারবেস ক্লাউড সেশন' : 'Firebase Cloud Session Active'}
                <CheckCircle2 className="text-emerald-500" size={18} />
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">
                {lang === 'bn' ? 'সিস্টেমটি সম্পূর্ণভাবে রিয়েল-টাইম ফায়ারবেস ফায়ারস্টোর ডাটাবেজ দ্বারা সুসংগত হচ্ছে।' : 'System fully interconnected with standard real-time Firebase Firestore database.'}
              </p>
            </div>
            {/* Download Audit Trail Report Button */}
            <button 
              onClick={() => window.print()}
              className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 hover:dark:bg-slate-700 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border border-slate-250 dark:border-slate-700"
            >
              <Download size={14} /> {lang === 'bn' ? 'রিপোর্ট মুদ্রণ' : 'Print Statement'}
            </button>
          </div>
        </div>
      </div>

      {/* Print Header only seen during system printing */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-6 mb-8 uppercase text-slate-900">
        <h1 className="text-3xl font-black">{settings.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ'}</h1>
        <p className="text-sm font-bold tracking-widest mt-1">{settings.nameEn}</p>
        <p className="text-xs font-semibold mt-1">{settings.addressBn}</p>
        <h2 className="text-xl font-black mt-4 tracking-wider underline">Financial Audit Statement</h2>
        <p className="text-[10px] font-mono mt-1">Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {loadingDonations || loadingExpenses ? (
          <SkeletonLoader variant="stats" count={4} className="col-span-full" />
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col items-center text-center gap-4 group hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-inner ${getStatColors(stat.color)}`}>
                {stat.icon}
              </div>
              <div className="min-w-0 w-full space-y-1">
                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 truncate">{stat.label}</div>
                <div className="text-lg md:text-2xl font-black text-slate-900 dark:text-white truncate tracking-tighter">{stat.val}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation Modules Section (Hidden on Print) */}
      <div className="space-y-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-emerald-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg">
            <LayoutGrid size={16} className="md:w-6 md:h-6" />
          </div>
          <h2 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {lang === 'bn' ? 'ম্যানেজমেন্ট মডিউলসমূহ' : 'Management Modules'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 gap-3 md:gap-5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const label = t[item.label as keyof typeof t] as string;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md hover:border-emerald-500 transition-all flex flex-col items-center text-center gap-2 md:gap-4"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 dark:bg-slate-950 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition-all border border-emerald-50 dark:border-emerald-900/30">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18, className: "md:w-6 md:h-6" })}
                </div>
                <div className="min-w-0 w-full animate-in fade-in">
                  <div className="text-[7px] md:text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">{item.label}</div>
                  <div className="text-[9px] md:text-xs font-black text-slate-900 dark:text-white truncate bengali">{label}</div>
                </div>
              </Link>
            );
          })}


        </div>
      </div>

      {/* LEDGER WORKSPACE: Primary Tab Switcher representing Donations vs Expenses Ledger */}
      <div id="ledger-workspace" className="space-y-6">
        <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px gap-6 print:hidden">
          <button 
            onClick={() => navigate('/admin/donations')}
            className={`pb-4 text-xs md:text-sm font-black uppercase tracking-wider transition-all border-b-2 relative ${dashboardView === 'donations' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {lang === 'bn' ? 'অনুদানের হিসাব (আয়)' : 'Income & Donation Ledger'}
            {pendingDonations.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black tracking-normal">
                {pendingDonations.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => navigate('/admin/expenses')}
            className={`pb-4 text-xs md:text-sm font-black uppercase tracking-wider transition-all border-b-2 relative ${dashboardView === 'expenses' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {lang === 'bn' ? 'সামাজিক ব্যয়ের খতিয়ান' : 'Expense & Social Cost Ledger'}
          </button>
        </div>

        {/* VIEW 1: DONATIONS MANAGEMENT */}
        {dashboardView === 'donations' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-850 shadow-xl overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800/50 w-full sm:w-auto flex-wrap gap-1">
                  <button onClick={() => setActiveTab('pending')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Clock size={14} /> {lang === 'bn' ? 'অপেক্ষমান অনুদান' : 'Pending'}
                    {pendingDonations.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-550 text-white text-[9px] font-black">{pendingDonations.length}</span>}
                  </button>
                  <button onClick={() => setActiveTab('approved')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'approved' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Check size={14} /> {lang === 'bn' ? 'অনুমোদিত অনুদান' : 'Approved'}
                    {approvedDonations.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black">{approvedDonations.length}</span>}
                  </button>
                  <button onClick={() => setActiveTab('rejected')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'rejected' ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                    <X size={14} /> {lang === 'bn' ? 'প্রত্যাখ্যাত অনুদান' : 'Rejected'}
                    {rejectedDonations.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">{rejectedDonations.length}</span>}
                  </button>
                </div>

                {/* Donation Search */}
                <div className="relative w-full sm:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Search size={15} />
                  </span>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'দাতা, মোবাইল, মেথড...' : 'Search donor, phone, txID...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-sans"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 w-full lg:w-auto justify-end print:hidden">
                <button onClick={() => setShowCashForm(!showCashForm)} className="w-full lg:w-auto bg-emerald-900 dark:bg-white dark:text-slate-900 text-white px-5 py-3.5 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2">
                  <Plus size={14} /> {lang === 'bn' ? 'অফলাইন নগদ এন্ট্রি' : 'Add Cash donation'}
                </button>
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                  <tr>
                    <th className="p-4 md:p-6">Donor Info</th>
                    <th className="p-4 md:p-6">Transaction ID</th>
                    <th className="p-4 md:p-6">Amount BDT</th>
                    <th className="p-4 md:p-6 text-right print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
                  {loadingDonations ? (
                    <tr>
                      <td colSpan={4} className="p-4">
                        <SkeletonLoader variant="table" count={4} />
                      </td>
                    </tr>
                  ) : (activeTab === 'pending' ? filteredPending : activeTab === 'approved' ? filteredApproved : filteredRejected).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">
                        {lang === 'bn' ? 'কোনো অনুদান পাওয়া যায়নি' : 'No matched entries found'}
                      </td>
                    </tr>
                  ) : (
                    (activeTab === 'pending' ? filteredPending : activeTab === 'approved' ? filteredApproved : filteredRejected).map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                        <td className="p-4 md:p-6">
                          <div className="font-black text-slate-900 dark:text-white text-xs md:text-sm mb-0.5 bengali leading-none">{d.isAnonymous ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : d.donorName}</div>
                          <div className="text-[8px] md:text-[10px] font-bold text-slate-400 flex items-center gap-1">
                             <Phone size={8} className="text-emerald-500" /> {d.phone}
                          </div>
                        </td>
                        <td className="p-4 md:p-6">
                          <div className="text-[8px] md:text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase mb-1">
                            {d.paymentMethod}
                          </div>
                          <div className="text-[8px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded uppercase border border-emerald-100 dark:border-emerald-900/40 truncate max-w-[80px] md:max-w-none">
                            {d.transactionId}
                          </div>
                        </td>
                        <td className="p-4 md:p-6 font-black text-xs md:text-lg text-slate-900 dark:text-white font-mono tracking-tighter">
                          ৳{d.amount.toLocaleString()}
                        </td>
                        <td className="p-4 md:p-6 text-right space-x-1 md:space-x-3 whitespace-nowrap print:hidden">
                          <button 
                            onClick={() => setSelectedDonationDetails(d)} 
                            title={lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
                            className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-605 hover:text-white dark:hover:bg-blue-500 dark:hover:text-slate-950 rounded-lg transition-all inline-flex"
                          >
                            <Eye size={12} />
                          </button>
                          <button 
                            onClick={() => handleEditDonation(d)} 
                            title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Donation'}
                            className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-655 hover:text-white rounded-lg transition-all inline-flex"
                          >
                            <Edit2 size={12} />
                          </button>
                          {d.status === DonationStatus.PENDING && (
                            <span className="inline-flex gap-1">
                              <button 
                                onClick={() => updateDonation(d.id, DonationStatus.APPROVED)} 
                                title={lang === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                                className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                              >
                                <Check size={12} />
                              </button>
                              <button 
                                onClick={() => updateDonation(d.id, DonationStatus.REJECTED)} 
                                title={lang === 'bn' ? 'প্রত্যাখ্যান করুন' : 'Reject'}
                                className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          )}
                          {d.status === DonationStatus.APPROVED && (
                            <button 
                              onClick={() => setViewingReceipt(d)} 
                              title={lang === 'bn' ? 'রসিদ প্রিন্ট' : 'Print Receipt'}
                              className="p-2 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-lg inline-flex"
                            >
                              <FileText size={12} />
                            </button>
                          )}
                          {d.status === DonationStatus.REJECTED && (
                            <button 
                              onClick={() => updateDonation(d.id, DonationStatus.APPROVED)} 
                              title={lang === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                              className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-all inline-flex"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setDeletingDonation(d);
                              setDeleteConfirmationWord('');
                            }} 
                            title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                            className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-605 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all inline-flex"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile-optimized Card View */}
            <div className="block md:hidden space-y-4">
              {loadingDonations ? (
                <div className="p-4">
                  <SkeletonLoader variant="list" count={4} />
                </div>
              ) : (activeTab === 'pending' ? filteredPending : activeTab === 'approved' ? filteredApproved : filteredRejected).length === 0 ? (
                <div className="p-10 text-center bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider">
                  {lang === 'bn' ? 'কোনো অনুদান পাওয়া যায়নি' : 'No matched entries found'}
                </div>
              ) : (
                (activeTab === 'pending' ? filteredPending : activeTab === 'approved' ? filteredApproved : filteredRejected).map(d => (
                  <div key={d.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-black text-slate-900 dark:text-white text-sm bengali leading-tight">
                          {d.isAnonymous ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : d.donorName}
                        </div>
                        <div className="text-[10px] mt-1 font-bold text-slate-400 flex items-center gap-1">
                          <Phone size={10} className="text-emerald-500" /> {d.phone}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[8px] mb-0.5">
                          {lang === 'bn' ? 'পরিমাণ' : 'Amount'}
                        </div>
                        <div className="font-black text-slate-905 dark:text-white font-mono tracking-tight text-base text-emerald-600 dark:text-emerald-400">
                          ৳{d.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100/60 dark:border-slate-800/60 text-[11px] font-bold">
                      <div>
                        <span className="block text-[8px] uppercase text-slate-400 mb-0.5">{lang === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Method'}</span>
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">{d.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase text-slate-400 mb-0.5">{lang === 'bn' ? 'লেনদেন আইডি' : 'TXID'}</span>
                        <span className="font-mono bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-100/20 dark:border-emerald-950/20 truncate block max-w-full font-black text-[9px]">
                          {d.transactionId}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-105 dark:border-slate-800/60 whitespace-nowrap print:hidden">
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setSelectedDonationDetails(d)} 
                          title={lang === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}
                          className="px-3 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase flex items-center gap-1"
                        >
                          <Eye size={12} /> {lang === 'bn' ? 'বিস্তারিত' : 'View'}
                        </button>
                        <button 
                          onClick={() => handleEditDonation(d)} 
                          title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Donation'}
                          className="px-3 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white rounded-xl transition-all font-black text-[10px] uppercase flex items-center gap-1"
                        >
                          <Edit2 size={12} /> {lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        {d.status === DonationStatus.PENDING && (
                          <>
                            <button 
                              onClick={() => updateDonation(d.id, DonationStatus.APPROVED)} 
                              title={lang === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                              className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => updateDonation(d.id, DonationStatus.REJECTED)} 
                              title={lang === 'bn' ? 'প্রত্যাখ্যান করুন' : 'Reject'}
                              className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {d.status === DonationStatus.APPROVED && (
                          <button 
                            onClick={() => setViewingReceipt(d)} 
                            title={lang === 'bn' ? 'রসিদ প্রিন্ট' : 'Print Receipt'}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-xl"
                          >
                            <FileText size={14} />
                          </button>
                        )}
                        {d.status === DonationStatus.REJECTED && (
                          <button 
                            onClick={() => updateDonation(d.id, DonationStatus.APPROVED)} 
                            title={lang === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                            className="p-2 bg-emerald-50 dark:bg-emerald-955/35 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setDeletingDonation(d);
                            setDeleteConfirmationWord('');
                          }} 
                          title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                          className="p-2 bg-rose-50 dark:bg-rose-955/35 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: EXPENSES & FINANCIAL AUDITING */}
        {dashboardView === 'expenses' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
            
            {/* Left Hand: Category breakdown / Monthly sheet info */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Monthly totals calculators card */}
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" /> 
                  <span>Monthly Ledger Breakdown</span>
                </h4>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800 pr-0.5 max-h-[220px] overflow-y-auto">
                  {monthlyList.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No historical months cached.</p>
                  ) : (
                    monthlyList.map(([monthKey, value]) => (
                      <div key={monthKey} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono font-black text-slate-900 dark:text-slate-100">{monthKey}</span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-black block">৳+{value.income.toLocaleString()}</span>
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-black block">৳-{value.expense.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Expense Category visual Distribution */}
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <TrendingDown size={14} className="text-rose-500" />
                  <span>Category-wise Spending</span>
                </h4>

                <div className="space-y-3.5 text-xs font-bold text-slate-500">
                  {["Education", "Health", "Mosque/Madrasa", "Sports", "General Welfare", "Operations"].map(category => {
                    const groupAmt = expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);
                    const percent = expenseTotal > 0 ? Math.round((groupAmt / expenseTotal) * 10) * 10 : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                          <span>{category}</span>
                          <span className="text-slate-900 dark:text-slate-200">৳{groupAmt.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Hand: Interactive expense table with dynamic add form option */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-850 shadow-xl overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                  
                  {/* Expense search filter */}
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                      <Search size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'ব্যয় বিবরণী খুঁজুন...' : 'Search expense details...'}
                      value={expenseSearchQuery}
                      onChange={(e) => setExpenseSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-sans text-xs"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end print:hidden">
                    <button 
                      onClick={() => setShowExpenseForm(!showExpenseForm)} 
                      className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> {lang === 'bn' ? 'নতুন সামাজিক ব্যয়' : 'Record Expense'}
                    </button>
                  </div>

                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-4">Explanation</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4 text-right print:hidden">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
                      {loadingExpenses ? (
                        <tr>
                          <td colSpan={5} className="p-4">
                            <SkeletonLoader variant="table" count={4} />
                          </td>
                        </tr>
                      ) : filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-slate-400 font-bold text-xs uppercase">
                            No matched spending found
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map(e => (
                          <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 text-xs transition-colors">
                            <td className="p-4 max-w-[200px]">
                              <div className="font-bold text-slate-900 dark:text-white line-clamp-2 bengali leading-relaxed">
                                {lang === 'bn' ? e.descriptionBn || e.descriptionEn : e.descriptionEn || e.descriptionBn}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-md bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 text-[10px] font-black uppercase tracking-wider">
                                {e.category}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-medium text-slate-400 whitespace-nowrap">
                              {e.date}
                            </td>
                            <td className="p-4 font-black font-mono text-slate-950 dark:text-slate-50 text-sm">
                              ৳{e.amount.toLocaleString()}
                            </td>
                            <td className="p-4 text-right print:hidden space-x-2">
                              <button onClick={() => handleEditExpense(e)} title={lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Expense'} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors inline-flex">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => {
                                if (confirm(lang === 'bn' ? 'আপনি কি আসলেই এই খরচের এন্ট্রিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this expense entry?')) {
                                  deleteExpense(e.id);
                                }
                              }} className="p-2 text-slate-300 hover:text-red-500">
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          </div>
        )}
      </div>

      {/* MODAL WINDOW 1: ADD CASH INCOME FORM / EDIT DONATION FORM */}
      {showCashForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseDonationForm} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in"></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl border border-slate-100 dark:border-slate-800 p-8 shadow-heavy relative animate-in zoom-in-95 duration-200 bengali max-h-[90vh] overflow-y-auto">
            <button onClick={handleCloseDonationForm} className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
              {editingDonationId 
                ? (lang === 'bn' ? 'অনুদান তথ্য সংশোধন' : 'Edit Donation Info')
                : (lang === 'bn' ? 'নগদ প্রাপ্তি এন্ট্রি' : 'Add Cash Donation')}
            </h3>
            <form onSubmit={handleCashSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {lang === 'bn' ? 'দাতার নাম' : 'Donor Name'} <span className="text-slate-300 ml-1">({lang === 'bn' ? 'ফাঁকা রাখলে বেনামী হবে' : 'Leave empty for Anonymous'})</span>
                </label>
                <input 
                  type="text"
                  placeholder={lang === 'bn' ? 'উদা: মোঃ সায়মন...' : 'e.g., Alhaj Yusuf'}
                  value={cashFormData.donorName}
                  onChange={e => setCashFormData({ ...cashFormData, donorName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-bold transition-all text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {lang === 'bn' ? 'পরিমাণ (টাকা) *' : 'Amount BDT *'}
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  placeholder="5000"
                  value={cashFormData.amount}
                  onChange={e => setCashFormData({ ...cashFormData, amount: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-black transition-all text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {lang === 'bn' ? 'গ্রহণের খাত *' : 'Donation Sector *'}
                </label>
                <select 
                  value={cashFormData.purpose}
                  onChange={e => setCashFormData({ ...cashFormData, purpose: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-black transition-all text-sm text-slate-900 dark:text-slate-100"
                >
                  {t.categories?.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Advanced info panel for edit and details correction */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'মোবাইল' : 'Phone'}
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. 01700000000"
                    value={cashFormData.phone}
                    onChange={e => setCashFormData({ ...cashFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-bold transition-all text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                  </label>
                  <input 
                    type="email"
                    placeholder="e.g. email@example.com"
                    value={cashFormData.email}
                    onChange={e => setCashFormData({ ...cashFormData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-bold transition-all text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {editingDonationId && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {lang === 'bn' ? 'পেমেন্ট গেটওয়ে' : 'Payment Method'}
                    </label>
                    <input 
                      type="text"
                      placeholder="Cash, bKash, etc."
                      value={cashFormData.paymentMethod}
                      onChange={e => setCashFormData({ ...cashFormData, paymentMethod: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-bold transition-all text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {lang === 'bn' ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}
                    </label>
                    <input 
                      type="text"
                      placeholder="TXN ID"
                      value={cashFormData.transactionId}
                      onChange={e => setCashFormData({ ...cashFormData, transactionId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-bold transition-all text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {editingDonationId && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'অনুমোদন অবস্থা' : 'Status'}
                  </label>
                  <select 
                    value={cashFormData.status}
                    onChange={e => setCashFormData({ ...cashFormData, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-black transition-all text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value={DonationStatus.APPROVED}>Approved (অনুমোদিত)</option>
                    <option value={DonationStatus.PENDING}>Pending (অপেক্ষমান)</option>
                    <option value={DonationStatus.REJECTED}>Rejected (প্রত্যাখ্যাত)</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-4 animate-in fade-in duration-300">
                <button 
                  type="button"
                  onClick={handleCloseDonationForm}
                  className="flex-1 bg-slate-50 dark:bg-slate-850 text-slate-650 dark:text-slate-300 font-bold text-xs uppercase py-4 rounded-2xl hover:bg-slate-100 cursor-pointer text-center border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white font-black text-xs uppercase py-4 rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all text-center"
                >
                  {editingDonationId ? (lang === 'bn' ? 'পরিবর্তন সংরক্ষণ' : 'Save Changes') : (lang === 'bn' ? 'নগদ সংরক্ষণ' : 'Save cash')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: ENTER / EDIT EXPENSE FORM */}
      {showExpenseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseExpenseForm} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in"></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl border border-slate-100 dark:border-slate-800 p-8 shadow-heavy relative animate-in zoom-in-95 duration-200 bengali max-h-[90vh] overflow-y-auto">
            <button onClick={handleCloseExpenseForm} className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl md:text-2xl font-black text-slate-905 dark:text-white mb-6 uppercase tracking-tight">
              {editingExpenseId
                ? (lang === 'bn' ? 'ব্যয়ের হিসাব সংশোধন করুন' : 'Edit Expense Details')
                : (lang === 'bn' ? 'নতুন ব্যয়ের হিসাব যুক্ত করুন' : 'Record New Expense')}
            </h3>
            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-405">Amount (BDT) *</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="1000"
                    value={expenseFormData.amount}
                    onChange={e => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl outline-none focus:border-red-500 font-bold text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-405">Date *</label>
                  <input 
                    type="date"
                    required
                    value={expenseFormData.date}
                    onChange={e => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl outline-none focus:border-red-500 font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-405">Expense Sector *</label>
                <select 
                  value={expenseFormData.category}
                  onChange={e => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {["Education", "Health", "Mosque/Madrasa", "Sports", "General Welfare", "Operations"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-405">Description (English) *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="e.g. Bought stationary, copybooks, and rulers for school aid..."
                  value={expenseFormData.descriptionEn}
                  onChange={e => setExpenseFormData({ ...expenseFormData, descriptionEn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-medium text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-405">বিবরণী (বাংলা) *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="উদা: সুবিধাবঞ্চিত শিক্ষার্থীদের সাহায্য ক্রটি স্কুল সাহায্য বিতরণ..."
                  value={expenseFormData.descriptionBn}
                  onChange={e => setExpenseFormData({ ...expenseFormData, descriptionBn: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-medium text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleCloseExpenseForm}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-300 py-3.5 rounded-xl border border-slate-250 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-rose-600 text-white font-black py-3.5 rounded-xl hover:bg-rose-700 active:scale-95 transition-all text-center"
                >
                  {editingExpenseId ? (lang === 'bn' ? 'সংশোধন সংরক্ষণ করুন' : 'Save Changes') : (lang === 'bn' ? 'ব্যয় সংরক্ষণ করুন' : 'Save Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DONATION DETAILS OVERLAY MODAL */}
      {selectedDonationDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 ${
              selectedDonationDetails.status === DonationStatus.APPROVED ? 'bg-emerald-500/10' :
              selectedDonationDetails.status === DonationStatus.REJECTED ? 'bg-rose-500/10' :
              'bg-amber-500/10'
            }`}>
              <div className="space-y-1">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  selectedDonationDetails.status === DonationStatus.APPROVED ? 'bg-emerald-500 text-white' :
                  selectedDonationDetails.status === DonationStatus.REJECTED ? 'bg-rose-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {selectedDonationDetails.status === DonationStatus.APPROVED ? (lang === 'bn' ? 'অনুমোদিত' : 'Approved') :
                   selectedDonationDetails.status === DonationStatus.REJECTED ? (lang === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected') :
                   (lang === 'bn' ? 'অপেক্ষমান' : 'Pending')}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                  {lang === 'bn' ? 'অনুদান বিবরণী' : 'Donation Details'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDonationDetails(null)}
                className="p-3 bg-white dark:bg-slate-800 hover:scale-105 rounded-xl border border-slate-150 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 transition-all hover:text-rose-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Donor Name Block */}
              <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 font-sans">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {lang === 'bn' ? 'দাতার নাম' : 'Donor Name'}
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {selectedDonationDetails.isAnonymous ? (lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous') : selectedDonationDetails.donorName}
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-4 font-sans">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'মোবাইল নাম্বার' : 'Phone Number'}
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{selectedDonationDetails.phone}</div>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'ইমেইল' : 'Email Address'}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedDonationDetails.email || (lang === 'bn' ? 'দেওয়া হয়নি' : 'None')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{selectedDonationDetails.paymentMethod}</div>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}
                  </div>
                  <div className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">{selectedDonationDetails.transactionId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'সাহায্যের খাত' : 'Donation Purpose'}
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">{selectedDonationDetails.purpose}</div>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {lang === 'bn' ? 'তারিখ ও সময়' : 'Submission Time'}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {new Date(selectedDonationDetails.date).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Amount highlights */}
              <div className="flex items-center justify-between bg-emerald-600/10 dark:bg-emerald-900/10 p-6 rounded-[1.8rem] border border-emerald-500/20 font-sans">
                <span className="font-black text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                  {lang === 'bn' ? 'মোট অনুদান পরিমাণ' : 'Total Amount'}
                </span>
                <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ৳{selectedDonationDetails.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Footer Action Panel */}
            <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between font-sans">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleEditDonation(selectedDonationDetails);
                    setSelectedDonationDetails(null);
                  }}
                  className="px-4 py-3 bg-amber-50 hover:bg-amber-600 hover:text-white dark:bg-slate-900 border border-amber-250 dark:border-slate-800 text-amber-600 rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-2 cursor-pointer shadow-soft active:scale-95"
                >
                  <Edit2 size={14} /> {lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
                </button>
                <button
                  onClick={() => {
                    setDeletingDonation(selectedDonationDetails);
                    setDeleteConfirmationWord('');
                    setSelectedDonationDetails(null);
                  }}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-slate-900 text-rose-600 rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-2"
                >
                  <Trash2 size={14} /> {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                </button>
              </div>

              <div className="flex gap-2">
                {selectedDonationDetails.status !== DonationStatus.APPROVED && (
                  <button
                    onClick={async () => {
                      await updateDonation(selectedDonationDetails.id, DonationStatus.APPROVED);
                      setSelectedDonationDetails({ ...selectedDonationDetails, status: DonationStatus.APPROVED });
                    }}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Check size={14} /> {lang === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                  </button>
                )}
                {selectedDonationDetails.status !== DonationStatus.REJECTED && (
                  <button
                    onClick={async () => {
                      await updateDonation(selectedDonationDetails.id, DonationStatus.REJECTED);
                      setSelectedDonationDetails({ ...selectedDonationDetails, status: DonationStatus.REJECTED });
                    }}
                    className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20"
                  >
                    <X size={14} /> {lang === 'bn' ? 'প্রত্যাখ্যান করুন' : 'Reject'}
                  </button>
                )}
                {selectedDonationDetails.status === DonationStatus.APPROVED && (
                  <>
                    <button
                      onClick={() => setDownloadingReceipt(selectedDonationDetails)}
                      disabled={downloadingReceipt !== null}
                      title={lang === 'bn' ? 'রসিদ পিডিএফ ডাউনলোড করুন' : 'Download Receipt PDF'}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 shadow-lg shadow-emerald-650/20 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {downloadingReceipt?.id === selectedDonationDetails.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          {lang === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Downloading...'}
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          {lang === 'bn' ? 'ডাউনলোড' : 'Download'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setViewingReceipt(selectedDonationDetails);
                        setSelectedDonationDetails(null);
                      }}
                      className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <FileText size={14} /> {lang === 'bn' ? 'রসিদ ও প্রিন্ট' : 'Receipt & Print'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DONATION MODAL */}
      {deletingDonation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            onClick={() => {
              setDeletingDonation(null);
              setDeleteConfirmationWord('');
            }} 
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          ></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-heavy relative z-[101] animate-in zoom-in-95 duration-200 bengali max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setDeletingDonation(null);
                setDeleteConfirmationWord('');
              }} 
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight font-sans">
                {lang === 'bn' ? 'স্থায়ীভাবে ডিলিট নিশ্চিতকরণ' : 'Confirm Deletion'}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold font-sans">
              {lang === 'bn' 
                ? 'অনুদান এন্ট্রিটি চিরতরে মুছে ফেলা হবে। এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়।' 
                : 'This action cannot be undone. The selected donation entry will be permanently deleted.'}
            </p>

            {/* Donation Summary Details */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-6 space-y-3.5 text-xs font-sans">
              <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-400 font-bold">{lang === 'bn' ? 'দাতার নাম' : 'Donor Name'}:</span>
                <span className="text-slate-800 dark:text-slate-200 font-black">
                  {deletingDonation.isAnonymous ? (lang === 'bn' ? 'বেনামী' : 'Anonymous') : deletingDonation.donorName}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-400 font-bold">{lang === 'bn' ? 'পরিমাণ (টাকা)' : 'Amount (BDT)'}:</span>
                <span className="text-rose-600 dark:text-rose-400 font-black">
                  ৳{deletingDonation.amount.toLocaleString()} BDT
                </span>
              </div>
              {deletingDonation.paymentMethod && (
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">{lang === 'bn' ? 'মাধ্যম' : 'Payment Method'}:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-black">{deletingDonation.paymentMethod}</span>
                </div>
              )}
              {deletingDonation.transactionId && (
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-400 font-bold">{lang === 'bn' ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono font-bold tracking-wider">{deletingDonation.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">{lang === 'bn' ? 'আবেদনের অবস্থা' : 'Status'}:</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                  deletingDonation.status === DonationStatus.APPROVED 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                    : deletingDonation.status === DonationStatus.REJECTED 
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                }`}>
                  {deletingDonation.status}
                </span>
              </div>
            </div>

            {/* Warning when deleting APPROVED donations */}
            {deletingDonation.status === DonationStatus.APPROVED && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-4 mb-6 font-sans">
                <div className="flex gap-2.5 items-start">
                  <div className="text-amber-600 dark:text-amber-400 mt-0.5">
                    <Lock size={15} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-tight">
                      {lang === 'bn' ? 'অনুমোদিত অনুদান ডিলিট সুরক্ষাবোধ' : 'Approved Ledger Deletion Policy'}
                    </p>
                    <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-400 font-semibold">
                      {lang === 'bn' 
                        ? 'সতর্কতা: এটি একটি অনুমোদিত বা প্রাপ্ত অনুদান, যা আপনার অডিট ট্রেইল ও ব্য্যালেন্সকে প্রভাবিত করবে। এটি ডিলিট করতে নিচে "DELETE" শব্দটি টাইপ করুন।' 
                        : 'Caution: This is an APPROVED donation. Deleting it directly alters the historical ledger totals and financial statement logic. Please type "DELETE" below to finalize.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <input 
                    type="text"
                    placeholder={lang === 'bn' ? 'ডিলিট সম্পন্ন করতে "DELETE" লিখুন' : 'Type "DELETE" to confirm'}
                    value={deleteConfirmationWord}
                    onChange={(e) => setDeleteConfirmationWord(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-amber-200 dark:border-amber-900/55 px-4 py-2.5 rounded-xl font-mono text-center text-xs font-black placeholder:text-slate-300 dark:placeholder:text-slate-700 uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            {/* Deletion confirmation button controls */}
            <div className="flex gap-3 font-sans">
              <button
                type="button"
                onClick={() => {
                  setDeletingDonation(null);
                  setDeleteConfirmationWord('');
                }}
                className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase cursor-pointer transition-all active:scale-95"
              >
                {lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deletingDonation.status === DonationStatus.APPROVED && deleteConfirmationWord.trim().toUpperCase() !== 'DELETE'}
                onClick={() => {
                  deleteDonation(deletingDonation.id);
                  setDeletingDonation(null);
                  setDeleteConfirmationWord('');
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-black text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-95 text-white ${
                  deletingDonation.status === DonationStatus.APPROVED && deleteConfirmationWord.trim().toUpperCase() !== 'DELETE'
                    ? 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-100 dark:border-slate-800/80'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20'
                }`}
              >
                <Trash2 size={13} />
                {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADLESS PDF RECEIPT RENDERER */}
      {downloadingReceipt && (
        <div 
          className="absolute" 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            top: '-9999px',
            width: '210mm',
            height: '297mm',
            overflow: 'hidden'
          }}
        >
          <ReceiptView 
            donation={downloadingReceipt}
            settings={settings}
            onBack={() => {}}
            autoDownload={true}
            onDownloadDone={() => setDownloadingReceipt(null)}
          />
        </div>
      )}

    </div>
  );
};
