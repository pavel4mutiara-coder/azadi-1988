import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/constants';
import { parseLocalDate } from '../../utils/parseLocalDate';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Activity, 
  BookOpen, 
  Users, 
  ChevronRight, 
  Printer, 
  Building, 
  Loader2,
  ArrowLeft,
  PieChart,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReportsManager: React.FC = () => {
  const { 
    lang, 
    donations = [], 
    expenses = [], 
    events = [], 
    notices = [], 
    news = [], 
    leadership = [], 
    settings 
  } = useApp();

  const navigate = useNavigate();
  const t = TRANSLATIONS[lang];

  // Report filters and states
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [reportType, setReportType] = useState<'performance' | 'financial'>('performance');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Derive list of years from data to populate dropdown dynamically
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    
    // Default years to ensure some exist
    yearsSet.add('2026');
    yearsSet.add('2025');
    yearsSet.add('2024');

    donations.forEach(d => {
      if (d.date) {
        const year = parseLocalDate(d.date).getFullYear().toString();
        yearsSet.add(year);
      }
    });

    expenses.forEach(e => {
      if (e.date) {
        const year = parseLocalDate(e.date).getFullYear().toString();
        yearsSet.add(year);
      }
    });

    events.forEach(ev => {
      if (ev.date) {
        const year = parseLocalDate(ev.date).getFullYear().toString();
        yearsSet.add(year);
      }
    });

    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [donations, expenses, events]);

  // Filtered datasets based on selectedYear
  const reportData = useMemo(() => {
    const isAllTime = selectedYear === 'all';
    
    const filteredDonations = donations.filter(d => {
      if (d.status !== 'APPROVED') return false;
      if (isAllTime) return true;
      const dYear = parseLocalDate(d.date).getFullYear().toString();
      return dYear === selectedYear;
    });

    const filteredExpenses = expenses.filter(e => {
      if (isAllTime) return true;
      const eYear = parseLocalDate(e.date).getFullYear().toString();
      return eYear === selectedYear;
    });

    const filteredEvents = events.filter(ev => {
      if (isAllTime) return true;
      const evYear = parseLocalDate(ev.date).getFullYear().toString();
      return evYear === selectedYear;
    });

    const filteredNotices = notices.filter(n => {
      if (isAllTime) return true;
      const nYear = parseLocalDate(n.date).getFullYear().toString();
      return nYear === selectedYear;
    });

    const filteredNews = news.filter(nw => {
      if (nw.date) {
        if (isAllTime) return true;
        const nwYear = parseLocalDate(nw.date).getFullYear().toString();
        return nwYear === selectedYear;
      }
      return false;
    });

    // Calculations
    const totalDonationsAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalDonationsAmount - totalExpensesAmount;

    // Categorized Donations
    const purposeBreakdown: { [key: string]: { amount: number; count: number } } = {};
    filteredDonations.forEach(d => {
      const p = d.purpose || 'General Welfare';
      if (!purposeBreakdown[p]) {
        purposeBreakdown[p] = { amount: 0, count: 0 };
      }
      purposeBreakdown[p].amount += d.amount;
      purposeBreakdown[p].count += 1;
    });

    // Categorized Expenses
    const expenseBreakdown: { [key: string]: { amount: number; count: number } } = {};
    filteredExpenses.forEach(e => {
      const cat = e.category || 'General Administration';
      if (!expenseBreakdown[cat]) {
        expenseBreakdown[cat] = { amount: 0, count: 0 };
      }
      expenseBreakdown[cat].amount += e.amount;
      expenseBreakdown[cat].count += 1;
    });

    // Monthly Trends
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => {
      monthlyData[m] = { income: 0, expense: 0 };
    });

    filteredDonations.forEach(d => {
      const dDate = parseLocalDate(d.date);
      const mIdx = dDate.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        monthlyData[months[mIdx]].income += d.amount;
      }
    });

    filteredExpenses.forEach(e => {
      const eDate = parseLocalDate(e.date);
      const mIdx = eDate.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        monthlyData[months[mIdx]].expense += e.amount;
      }
    });

    return {
      donations: filteredDonations,
      expenses: filteredExpenses,
      events: filteredEvents,
      notices: filteredNotices,
      news: filteredNews,
      totalDonationsAmount,
      totalExpensesAmount,
      netBalance,
      purposeBreakdown,
      expenseBreakdown,
      monthlyData,
      months
    };
  }, [selectedYear, donations, expenses, events, notices, news]);

  // Export to PDF handler
  const handleExportPDF = async () => {
    try {
      setIsGenerating(true);
      const element = reportRef.current;
      if (!element) return;

      let html2pdfLib = (window as any).html2pdf;
      if (!html2pdfLib) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = () => {
            html2pdfLib = (window as any).html2pdf;
            resolve();
          };
          script.onerror = () => {
            reject(new Error("Failed to load html2pdf script"));
          };
          document.head.appendChild(script);
        });
      }

      if (!html2pdfLib) {
        window.print();
        return;
      }

      const filename = `${settings?.nameEn || 'ASWO'}_Annual_Report_${selectedYear === 'all' ? 'All_Time' : selectedYear}_${reportType}.pdf`.replace(/\s+/g, '_');

      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: false,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdfLib().from(element).set(opt).save();
    } catch (err) {
      console.error("Failed to generate Report PDF, falling back to window.print()", err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all shadow-sm"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <FileText className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {lang === 'bn' ? 'প্রতিবেদন ও নিরীক্ষা' : 'Reports & Audits'}
                </h1>
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider mt-1">
                {lang === 'bn' ? 'বার্ষিক কর্মক্ষমতা এবং আর্থিক বিবরণী তৈরি করুন' : 'Generate Annual Performance & Financial Statements'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Year Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1.5 shadow-sm text-slate-900 dark:text-white font-bold text-xs uppercase">
              <span>{lang === 'bn' ? 'বছর:' : 'Year:'}</span>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent border-none focus:outline-none cursor-pointer pr-1"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr} className="bg-white dark:bg-slate-900">{yr}</option>
                ))}
                <option value="all" className="bg-white dark:bg-slate-900">{lang === 'bn' ? 'সর্বমোট' : 'All Time'}</option>
              </select>
            </div>

            {/* Action buttons */}
            <button 
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {lang === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...'}
                </>
              ) : (
                <>
                  <Download size={16} />
                  {lang === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Option Tabs for Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setReportType('performance')}
            className={`p-6 rounded-[2rem] border text-left flex items-start gap-4 transition-all ${
              reportType === 'performance' 
                ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-xl' 
                : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-4 rounded-2xl ${reportType === 'performance' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Activity size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {lang === 'bn' ? 'বার্ষিক কর্মক্ষমতা প্রতিবেদন' : 'Annual Performance Report'}
              </h3>
              <p className="text-xs text-slate-400 font-bold dark:text-slate-500 leading-relaxed">
                {lang === 'bn' 
                  ? 'ইভেন্টস, টিম সদস্য, নোটিশ, সাম্প্রতিক সংবাদ ও সাংগঠনিক কার্যক্রমের সংক্ষিপ্ত রূপ।' 
                  : 'Includes events, leadership team overview, notices communications, news, and overall operational performance metrics.'}
              </p>
            </div>
          </button>

          <button 
            onClick={() => setReportType('financial')}
            className={`p-6 rounded-[2rem] border text-left flex items-start gap-4 transition-all ${
              reportType === 'financial' 
                ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-xl' 
                : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            <div className={`p-4 rounded-2xl ${reportType === 'financial' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <TrendingUp size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                {lang === 'bn' ? 'আর্থিক বিবরণী ও আয়-ব্যয় বিবরণী' : 'Financial & Donation Statement'}
              </h3>
              <p className="text-xs text-slate-400 font-bold dark:text-slate-500 leading-relaxed">
                {lang === 'bn' 
                  ? 'অনুমোদিত তহবিল সংগ্রহ, ব্যয়ের খাত, ব্যালেন্স শিট, বিভাগ ভিত্তিক অনুদান এবং মাসিক আয়-ব্যয়ের তুলনা।' 
                  : 'Shows approved donation income, expense categories, balance details, specific purpose breakdowns, and monthly trends.'}
              </p>
            </div>
          </button>
        </div>

        {/* Printable/Preview Frame */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 sm:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
              <Building size={12} className="text-emerald-500" />
              {lang === 'bn' ? 'লাইভ প্রিভিউ (এ৪ ফরম্যাট)' : 'Live Preview (A4 Format)'}
            </span>
            <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              {lang === 'bn' ? 'অফিসিয়াল ডকুমেন্ট' : 'Official Document'}
            </span>
          </div>

          {/* This wrapper element is the container that html2pdf exports.
              We force it to have explicit styles matching standard A4 dimensions on export,
              and we keep it pristine white with slate text so it prints nicely on real paper. */}
          <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-inner bg-slate-100 p-2 sm:p-6 flex justify-center">
            
            <div 
              ref={reportRef}
              className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 font-sans relative flex flex-col justify-between"
              style={{ color: '#0f172a' }} // Force deep navy slate text for high contrast printing
            >
              
              {/* Report Content */}
              <div>
                {/* Letterhead Header */}
                <div className="border-b-[3px] border-emerald-600 pb-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  <div className="text-center sm:text-left space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight bengali">
                      {lang === 'bn' ? settings?.nameBn : settings?.nameEn}
                    </h2>
                    <p className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase">
                      {lang === 'bn' ? settings?.sloganBn : settings?.sloganEn}
                    </p>
                    <div className="text-[10px] font-bold text-slate-500 space-y-0.5 mt-2">
                      <div className="bengali">{lang === 'bn' ? `প্রতিষ্ঠিত: ${settings?.establishedBn}` : `Established: ${settings?.establishedEn}`}</div>
                      <div className="bengali">{lang === 'bn' ? `ঠিকানা: ${settings?.addressBn}` : `Address: ${settings?.addressEn}`}</div>
                      <div>{lang === 'bn' ? `যোগাযোগ: ${settings?.phone} | ইমেইল: ${settings?.email}` : `Contact: ${settings?.phone} | Email: ${settings?.email}`}</div>
                    </div>
                  </div>
                  
                  {/* Decorative Logo Stamp */}
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-xl select-none">
                    {settings?.nameEn ? settings.nameEn.substring(0, 2).toUpperCase() : 'AS'}
                  </div>
                </div>

                {/* Document Title & Meta */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight bengali">
                        {reportType === 'performance' 
                          ? (lang === 'bn' ? 'বার্ষিক কর্মক্ষমতা প্রতিবেদন' : 'Annual Performance Report')
                          : (lang === 'bn' ? 'বার্ষিক আর্থিক বিবরণী ও আয়-ব্যয় হিসাব' : 'Annual Financial & Donation Statement')
                        }
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {lang === 'bn' ? 'প্রতিবেদন কাল:' : 'Report Period:'} {selectedYear === 'all' ? (lang === 'bn' ? 'সর্বকালীন' : 'All-Time Records') : `${selectedYear}`}
                      </p>
                    </div>
                    <div className="text-left sm:text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider space-y-0.5">
                      <div>{lang === 'bn' ? 'তৈরির তারিখ:' : 'Generated Date:'} {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div>{lang === 'bn' ? 'অবস্থা:' : 'Status:'} <span className="text-emerald-600 font-black">{lang === 'bn' ? 'অনুমোদিত ও নিরীক্ষিত' : 'AUDITED & APPROVED'}</span></div>
                    </div>
                  </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট অনুদান (আয়)' : 'Total Donations (Income)'}</div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 font-mono">৳{reportData.totalDonationsAmount.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট ব্যয় (খরচ)' : 'Total Expenditures'}</div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 font-mono">৳{reportData.totalExpensesAmount.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'চলতি উদ্বৃত্ত (ব্যালেন্স)' : 'Net Account Balance'}</div>
                    <div className={`text-lg sm:text-xl font-black mt-1 font-mono ${reportData.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      ৳{reportData.netBalance.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? 'মোট সামাজিক কার্যক্রম' : 'Hosted Campaigns'}</div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">{reportData.events.length} {lang === 'bn' ? 'টি' : 'Events'}</div>
                  </div>
                </div>

                {/* DYNAMIC REPORT LAYOUT - TYPE A: PERFORMANCE */}
                {reportType === 'performance' && (
                  <div className="space-y-8">
                    
                    {/* Operational Highlights */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-1 flex items-center gap-1.5">
                        <Activity size={14} className="text-emerald-500" />
                        {lang === 'bn' ? 'সাংগঠনিক কার্যক্রমের সারসংক্ষেপ' : 'Operational Summary'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-center">
                          <div className="text-xl sm:text-2xl font-black text-slate-800">{reportData.notices.length}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{lang === 'bn' ? 'অফিসিয়াল নোটিশ' : 'Notices Published'}</div>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-center">
                          <div className="text-xl sm:text-2xl font-black text-slate-800">{reportData.news.length}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{lang === 'bn' ? 'সংবাদ ও বুলেটিন' : 'News & Press Posts'}</div>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-center">
                          <div className="text-xl sm:text-2xl font-black text-slate-800">
                            {leadership.filter(l => l.status !== 'inactive').length}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{lang === 'bn' ? 'সক্রিয় সদস্য ও উপদেষ্টা' : 'Active Executives'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Campaigns & Public Events List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-1 flex items-center gap-1.5">
                        <Calendar size={14} className="text-emerald-500" />
                        {lang === 'bn' ? 'ইভেন্টস ও সামাজিক কর্মসূচিসমূহ' : 'Hosted Campaigns & Milestones'}
                      </h4>
                      {reportData.events.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">{lang === 'bn' ? 'কোন রেকর্ড পাওয়া যায়নি' : 'No records found for this period'}</p>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[9px] tracking-wider">
                              <th className="py-2 w-28">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                              <th className="py-2">{lang === 'bn' ? 'ইভেন্ট শিরোনাম' : 'Event Title'}</th>
                              <th className="py-2 w-44">{lang === 'bn' ? 'স্থান' : 'Location'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.events.slice(0, 10).map(ev => (
                              <tr key={ev.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-2.5 font-bold font-mono">
                                  {parseLocalDate(ev.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2.5 font-bold text-slate-800 bengali">
                                  {lang === 'bn' ? ev.titleBn : ev.titleEn}
                                </td>
                                <td className="py-2.5 text-slate-500 bengali">
                                  {lang === 'bn' ? ev.locationBn : ev.locationEn}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Published Notices */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-1 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-emerald-500" />
                        {lang === 'bn' ? 'প্রকাশিত নোটিশসমূহ' : 'Official Notices Registry'}
                      </h4>
                      {reportData.notices.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">{lang === 'bn' ? 'কোন নোটিশ পাওয়া যায়নি' : 'No notices found for this period'}</p>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[9px] tracking-wider">
                              <th className="py-2 w-28">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                              <th className="py-2">{lang === 'bn' ? 'বিষয়' : 'Subject'}</th>
                              <th className="py-2 w-24 text-right">{lang === 'bn' ? 'অগ্রাধিকার' : 'Priority'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.notices.slice(0, 8).map(n => (
                              <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-2.5 font-bold font-mono">
                                  {parseLocalDate(n.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2.5 font-bold text-slate-800 bengali">
                                  {lang === 'bn' ? n.titleBn : n.titleEn}
                                </td>
                                <td className="py-2.5 text-right">
                                  {n.isUrgent ? (
                                    <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{lang === 'bn' ? 'জরুরি' : 'URGENT'}</span>
                                  ) : (
                                    <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{lang === 'bn' ? 'স্বাভাবিক' : 'NORMAL'}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* DYNAMIC REPORT LAYOUT - TYPE B: FINANCIAL SUMMARY */}
                {reportType === 'financial' && (
                  <div className="space-y-8">
                    
                    {/* Purpose Breakdown (Income Category Chart) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-1 flex items-center gap-1.5">
                        <PieChart size={14} className="text-emerald-500" />
                        {lang === 'bn' ? 'খাত ভিত্তিক মোট অনুদান প্রাপ্তি (আয়)' : 'Donation Income by Purpose'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* CSS Progress Bars acting as a chart */}
                        <div className="space-y-3">
                          {Object.keys(reportData.purposeBreakdown).length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">{lang === 'bn' ? 'কোন অনুদান পাওয়া যায়নি' : 'No donations recorded'}</p>
                          ) : (
                            Object.entries(reportData.purposeBreakdown).map(([purpose, stat]) => {
                              const percentage = reportData.totalDonationsAmount > 0 
                                ? Math.round((stat.amount / reportData.totalDonationsAmount) * 100)
                                : 0;
                              return (
                                <div key={purpose} className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold text-slate-700">
                                    <span className="bengali">{purpose}</span>
                                    <span>৳{stat.amount.toLocaleString()} ({percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Audit Details */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'bn' ? 'নিরীক্ষা বিবরণ' : 'Audit Insights'}</h5>
                            <ul className="text-xs text-slate-600 font-bold space-y-2">
                              <li className="flex items-center gap-2">
                                <FileCheck size={14} className="text-emerald-500 shrink-0" />
                                <span>{lang === 'bn' ? `মোট দাতাদের ট্রানজেকশন সংখ্যা: ${reportData.donations.length} টি` : `Total donors transaction entries: ${reportData.donations.length}`}</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <FileCheck size={14} className="text-emerald-500 shrink-0" />
                                <span>{lang === 'bn' ? `ব্যয় ভাউচার ট্রানজেকশন সংখ্যা: ${reportData.expenses.length} টি` : `Total expense vouchers approved: ${reportData.expenses.length}`}</span>
                              </li>
                            </ul>
                          </div>
                          <div className="pt-4 border-t border-slate-200/50 mt-4 text-[10px] text-slate-400 font-bold leading-relaxed">
                            {lang === 'bn' 
                              ? '* সকল লেনদেন স্বচ্ছতার সাথে সংরক্ষণ করা হয়েছে এবং ভাউচার দ্বারা নিরীক্ষিত।' 
                              : '* All entries are audited against original receipts, mobile banking logs, and cash vouchers.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expenditures Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-1 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-500" />
                        {lang === 'bn' ? 'ব্যয়ের বিশদ বিবরণ (খরচ)' : 'Categorized Expenditures Detail'}
                      </h4>
                      {reportData.expenses.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">{lang === 'bn' ? 'কোন ব্যয়ের রেকর্ড নেই' : 'No expenditures logged for this period'}</p>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[9px] tracking-wider">
                              <th className="py-2 w-28">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                              <th className="py-2 w-44">{lang === 'bn' ? 'খাত (ক্যাটাগরি)' : 'Category'}</th>
                              <th className="py-2">{lang === 'bn' ? 'বর্ণনা' : 'Description'}</th>
                              <th className="py-2 text-right w-28">{lang === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.expenses.slice(0, 10).map(exp => (
                              <tr key={exp.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-2.5 font-bold font-mono">
                                  {parseLocalDate(exp.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2.5 font-bold text-slate-800 bengali">
                                  {exp.category}
                                </td>
                                <td className="py-2.5 text-slate-500 bengali line-clamp-1 truncate">
                                  {lang === 'bn' ? exp.descriptionBn : exp.descriptionEn}
                                </td>
                                <td className="py-2.5 text-right font-black font-mono text-slate-900">
                                  ৳{exp.amount.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Monthly Income vs Expense Breakdown Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-1 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-500" />
                        {lang === 'bn' ? 'মাসিক লেনদেনের তুলনা চিত্র' : 'Monthly Financial Distribution'}
                      </h4>
                      <table className="w-full text-left border-collapse text-xs text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase font-black text-[9px] tracking-wider">
                            <th className="py-2">{lang === 'bn' ? 'মাস' : 'Month'}</th>
                            <th className="py-2 text-right">{lang === 'bn' ? 'মোট প্রাপ্তি (৳)' : 'Total Received (৳)'}</th>
                            <th className="py-2 text-right">{lang === 'bn' ? 'মোট ব্যয় (৳)' : 'Total Expended (৳)'}</th>
                            <th className="py-2 text-right">{lang === 'bn' ? 'ব্যালেন্স (৳)' : 'Net Change (৳)'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.months.map(m => {
                            const monthVal = reportData.monthlyData[m];
                            const diff = monthVal.income - monthVal.expense;
                            if (monthVal.income === 0 && monthVal.expense === 0) return null; // Only show months with activity
                            return (
                              <tr key={m} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-2.5 font-bold">{m}</td>
                                <td className="py-2.5 text-right font-mono text-emerald-600">৳{monthVal.income.toLocaleString()}</td>
                                <td className="py-2.5 text-right font-mono text-slate-600">৳{monthVal.expense.toLocaleString()}</td>
                                <td className={`py-2.5 text-right font-mono font-bold ${diff >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  ৳{diff.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* Multi-page break safety indicator (standard for html2pdf) */}
                <div className="html2pdf__page-break" />

                {/* Audit Signature / Stamp Footer block */}
                <div className="mt-16 pt-12 border-t border-dashed border-slate-200 grid grid-cols-2 gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                  <div className="space-y-6">
                    <div className="text-slate-900 border-b border-slate-200 pb-2 w-44 mx-auto font-black" style={{ contentVisibility: 'auto' }}>
                      {/* Blank Line for Signature */}
                    </div>
                    <div>{lang === 'bn' ? 'অর্থ সম্পাদক' : 'Finance Secretary'}</div>
                  </div>
                  <div className="space-y-6">
                    <div className="text-slate-900 border-b border-slate-200 pb-2 w-44 mx-auto font-black">
                      {/* Blank Line for Signature */}
                    </div>
                    <div>{lang === 'bn' ? 'সভাপতি / সাধারণ সম্পাদক' : 'Chairman / General Secretary'}</div>
                  </div>
                </div>

              </div>

              {/* PDF Footer Area */}
              <div className="mt-12 text-center text-[9px] font-black tracking-widest text-slate-400 border-t pt-4">
                {lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংস্থা - সর্বস্বত্ব সংরক্ষিত ২০২৬ ©' : 'AZADI SOCIAL WELFARE ORGANIZATION - ALL RIGHTS RESERVED 2026 ©'}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
