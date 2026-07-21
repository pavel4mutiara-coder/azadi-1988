import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { DonationStatus, Donation } from '../types';
import { 
  ShieldCheck, CheckCircle2, Clock, XCircle, Search, 
  Building2, Calendar, FileText, ArrowLeft, Heart, Lock, AlertTriangle, Download
} from 'lucide-react';
import { parseLocalDate } from '../utils/parseLocalDate';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';
import { ReceiptView } from './admin/ReceiptView';

export const VerifyReceipt: React.FC = () => {
  const { receiptId } = useParams<{ receiptId?: string }>();
  const { lang, donations, settings } = useApp();
  const t = TRANSLATIONS[lang];

  const [searchInput, setSearchInput] = useState(receiptId || '');
  const [searchedId, setSearchedId] = useState(receiptId || '');
  const [showFullReceipt, setShowFullReceipt] = useState(false);

  useEffect(() => {
    if (receiptId) {
      setSearchInput(receiptId);
      setSearchedId(receiptId);
    }
  }, [receiptId]);

  // Find matching donation safely
  const matchedDonation = React.useMemo(() => {
    if (!searchedId.trim()) return null;
    const query = searchedId.trim().toLowerCase().replace(/^rec-/, '');
    
    return donations.find(d => {
      const idMatch = d.id.toLowerCase() === query || d.id.toLowerCase().endsWith(query);
      const recMatch = `rec-${d.id.slice(-8)}`.toLowerCase() === searchedId.trim().toLowerCase();
      const txMatch = d.transactionId && d.transactionId.toLowerCase() === query;
      return idMatch || recMatch || txMatch;
    });
  }, [donations, searchedId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchedId(searchInput.trim());
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = parseLocalDate(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr || '';
    }
  };

  if (showFullReceipt && matchedDonation) {
    return (
      <ReceiptView
        donation={matchedDonation}
        settings={settings}
        onBack={() => setShowFullReceipt(false)}
        isPublic={true}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
      <PageHero
        icon={<ShieldCheck size={20} />}
        badgeBn="অফিসিয়াল রশিদ যাচাইকরণ"
        badgeEn="Receipt Verification"
        titleBn="অনুদান রশিদ যাচাইকরণ"
        titleEn="Verify Official Donation Receipt"
        subtitleBn="আজাদী সমাজ কল্যাণ সংঘের প্রদত্ত অফিসিয়াল অনুদান রশিদের সত্যতা ও নিরাপত্তা যাচাই করুন।"
        subtitleEn="Authenticate and verify official donation receipts issued by Azadi Social Welfare Organization."
        breadcrumbs={[
          { labelBn: "অনুদান", labelEn: "Donation", path: "/donation" },
          { labelBn: "রশিদ যাচাই", labelEn: "Verify Receipt" }
        ]}
      />

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft flex items-center gap-3">
          <div className="pl-4 text-slate-400">
            <Search size={22} className="text-blue-600 dark:text-amber-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={lang === 'bn' ? 'রশিদ নম্বর বা আইডি লিখুন (যেমন: REC-12345678)...' : 'Enter Receipt ID (e.g. REC-12345678)...'}
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white font-bold text-sm sm:text-base placeholder-slate-400 py-2"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer shrink-0"
          >
            {lang === 'bn' ? 'যাচাই করুন' : 'Verify Now'}
          </button>
        </form>
      </div>

      {/* Result Section */}
      {searchedId ? (
        matchedDonation ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-heavy space-y-8 animate-in zoom-in-95 duration-300">
            
            {/* Status Header Banner */}
            <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
              matchedDonation.status === DonationStatus.APPROVED
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : matchedDonation.status === DonationStatus.PENDING
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                matchedDonation.status === DonationStatus.APPROVED
                  ? 'bg-emerald-600 text-white'
                  : matchedDonation.status === DonationStatus.PENDING
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-600 text-white'
              }`}>
                {matchedDonation.status === DonationStatus.APPROVED ? (
                  <CheckCircle2 size={32} />
                ) : matchedDonation.status === DonationStatus.PENDING ? (
                  <Clock size={32} />
                ) : (
                  <XCircle size={32} />
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {lang === 'bn' ? 'যাচাইকরণের ফলাফল' : 'Verification Status'}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-current">
                    {matchedDonation.status}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black">
                  {matchedDonation.status === DonationStatus.APPROVED
                    ? (lang === 'bn' ? 'বৈধ ও অনুমোদিত অফিসিয়াল অনুদান রশিদ' : 'Verified Official Donation Receipt')
                    : matchedDonation.status === DonationStatus.PENDING
                    ? (lang === 'bn' ? 'অপেক্ষাধিীন - যাচাইকরণ প্রক্রিয়াধীন রয়েছে' : 'Pending Verification - Under Review')
                    : (lang === 'bn' ? 'অপ্রমাণিত বা বাতিলকৃত অনুরোধ' : 'Rejected or Unverified Transaction')}
                </h3>
              </div>
            </div>

            {/* Safe Public Details Card */}
            <div className="space-y-6 pt-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center">
                <h4 className="text-sm font-black uppercase text-blue-700 dark:text-amber-400 tracking-wider flex items-center gap-2">
                  <Building2 size={16} />
                  <span>{lang === 'bn' ? 'রশিদ ও অনুদানের তথ্য' : 'Receipt & Audit Details'}</span>
                </h4>
                <span className="text-xs font-mono font-black text-slate-500">
                  REC-{matchedDonation.id.slice(-8)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'সংগঠনের নাম' : 'Organization'}
                  </span>
                  <p className="font-black text-slate-900 dark:text-white">
                    {lang === 'bn' ? settings.nameBn : settings.nameEn}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'অনুদানের তারিখ' : 'Date Issued'}
                  </span>
                  <p className="font-black text-slate-900 dark:text-white">
                    {formatDate(matchedDonation.date)}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'অনুদানের খাত / উদ্দেশ্য' : 'Purpose / Campaign'}
                  </span>
                  <p className="font-black text-slate-900 dark:text-white">
                    {matchedDonation.purpose || 'General Welfare'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'অনুদানের পরিমাণ' : 'Verified Amount'}
                  </span>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg font-mono">
                    ৳ {matchedDonation.amount.toLocaleString()} BDT
                  </p>
                </div>
              </div>

              {/* Data Privacy & Security Guarantee Note */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Lock size={16} className="text-blue-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  {lang === 'bn' 
                    ? 'গোপনীয়তা রক্ষার স্বার্থে দাতার ব্যক্তিগত তথ্য (মোবাইল নম্বর, ইমেইল ও ব্যাংকিং তথ্য) এই পাবলিক পেজে প্রদর্শন করা হয় না।' 
                    : 'To protect donor privacy, personal contact details and banking credentials are hidden on public verification pages.'}
                </p>
              </div>

              {/* View Full Receipt Button */}
              {matchedDonation.status === DonationStatus.APPROVED && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setShowFullReceipt(true)}
                    className="px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText size={16} />
                    <span>{lang === 'bn' ? 'সম্পূর্ণ পিডিএফ রশিদ দেখুন / ডাউনলোড করুন' : 'View & Download Full PDF Receipt'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Error State when Receipt Not Found */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-heavy text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'রশিদ তথ্য পাওয়া যায়নি' : 'Invalid or Unrecognized Receipt ID'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {lang === 'bn'
                  ? `"${searchedId}" আইডি বা ট্রানজেকশন আইডিটির সাথে কোনো অনুমোদিত ডাটা ম্যাচ করেনি। অনুগ্রহ করে নম্বরটি সঠিকভাবে চেক করুন।`
                  : `No matching receipt found for "${searchedId}". Please double-check the ID or contact our team if you believe this is an error.`}
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Link
                to="/donation-history"
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all"
              >
                {lang === 'bn' ? 'ইতিহাস সার্চ করুন' : 'Check History Search'}
              </Link>
            </div>
          </div>
        )
      ) : (
        /* Empty Prompt State */
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
          <ShieldCheck size={48} className="mx-auto text-blue-600/40 dark:text-amber-400/40" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            {lang === 'bn' ? 'রশিদ নম্বর লিখে সার্চ করুন' : 'Enter a Receipt ID to verify authenticity'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'bn' 
              ? 'আপনার সংগৃহীত অথবা পিডিএফ রশিদে থাকা আইডি ব্যবহার করে সত্যতা যাচাই করতে পারবেন।' 
              : 'Scan the QR code on your official PDF receipt or enter the Receipt ID directly.'}
          </p>
        </div>
      )}

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
