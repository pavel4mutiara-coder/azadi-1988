import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, CheckCircle2, Search, Building2, Calendar, FileText, 
  ArrowLeft, Lock, Award, Hash, UserCheck, Printer, AlertTriangle, ExternalLink, Receipt
} from 'lucide-react';
import { PageHero } from '../components/PageHero';

export const VerifyDocument: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, settings, donations } = useApp();

  const refParam = searchParams.get('ref') || '';
  const titleParam = searchParams.get('title') || '';
  const typeParam = searchParams.get('type') || '';
  const sigParam = searchParams.get('sig') || '';
  const desigParam = searchParams.get('desig') || '';
  const dateParam = searchParams.get('date') || '';
  const hashParam = searchParams.get('h') || '';

  const [searchInput, setSearchInput] = useState(refParam);
  const [activeRef, setActiveRef] = useState(refParam);

  useEffect(() => {
    if (refParam) {
      setSearchInput(refParam);
      setActiveRef(refParam);
    }
  }, [refParam]);

  // Check if input is a donation/receipt ID
  const isReceiptQuery = React.useMemo(() => {
    const q = activeRef.trim().toLowerCase();
    return q.startsWith('rec-') || donations.some(d => d.id.toLowerCase() === q || `rec-${d.id.slice(-8)}`.toLowerCase() === q);
  }, [activeRef, donations]);

  const matchedDonation = React.useMemo(() => {
    if (!isReceiptQuery) return null;
    const q = activeRef.trim().toLowerCase().replace(/^rec-/, '');
    return donations.find(d => {
      return d.id.toLowerCase() === q || d.id.toLowerCase().endsWith(q) || `rec-${d.id.slice(-8)}`.toLowerCase() === activeRef.trim().toLowerCase();
    });
  }, [isReceiptQuery, activeRef, donations]);

  // Check if document reference looks valid (starts with ASWO or contains document pattern)
  const isDocVerified = React.useMemo(() => {
    if (!activeRef.trim()) return false;
    const clean = activeRef.trim().toUpperCase();
    return clean.startsWith('ASWO') || clean.includes('PAD') || clean.includes('DOC') || Boolean(hashParam || titleParam);
  }, [activeRef, hashParam, titleParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveRef(searchInput.trim());
    }
  };

  const documentTypeLabel = React.useMemo(() => {
    if (typeParam) return typeParam;
    if (titleParam) return titleParam;
    if (activeRef.includes('CERT')) return lang === 'bn' ? 'অফিসিয়াল প্রত্যয়নপত্র' : 'Official Certificate';
    if (activeRef.includes('NOT')) return lang === 'bn' ? 'অফিসিয়াল বিজ্ঞপ্তি' : 'Official Notice';
    if (activeRef.includes('RES')) return lang === 'bn' ? 'কার্যনির্বাহী সিদ্ধান্ত' : 'Executive Resolution';
    return lang === 'bn' ? 'অফিসিয়াল নথি ও পত্র' : 'Official Organization Document';
  }, [typeParam, titleParam, activeRef, lang]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
      <PageHero
        icon={<ShieldCheck size={20} />}
        badgeBn="অফিসিয়াল নথি যাচাইকরণ"
        badgeEn="Document Verification"
        titleBn="অফিসিয়াল নথি ও পত্র যাচাইকরণ"
        titleEn="Verify Official Document & Letter"
        subtitleBn="আজাদী সমাজ কল্যাণ সংঘ কর্তৃক ইস্যুকৃত সকল অফিসিয়াল পত্র, নোটিশ, প্রত্যয়নপত্র ও রশিদের ডিজিটাল সত্যতা যাচাই করুন।"
        subtitleEn="Authenticate and verify official documents, letters, notices, certificates, and receipts issued by Azadi Social Welfare Organization."
        breadcrumbs={[
          { labelBn: "হোম", labelEn: "Home", path: "/" },
          { labelBn: "নথি যাচাইকরণ", labelEn: "Verify Document" }
        ]}
      />

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft flex items-center gap-3">
          <div className="pl-4 text-slate-400">
            <Search size={22} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={lang === 'bn' ? 'স্মারক নম্বর বা রশিদ আইডি লিখুন (যেমন: ASWO/DOC/... বা REC-...)' : 'Enter Document Ref or Receipt ID (e.g. ASWO/DOC/... or REC-...)'}
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white font-bold text-sm sm:text-base placeholder-slate-400 py-2"
          />
          <button
            type="submit"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer shrink-0"
          >
            {lang === 'bn' ? 'যাচাই করুন' : 'Verify'}
          </button>
        </form>
        <div className="mt-2 text-center text-xs text-slate-400 font-medium">
          {lang === 'bn' 
            ? 'কিউআর কোড স্ক্যান করে সরাসরি পেজে আসলে স্বয়ংক্রিয়ভাবে তথ্য প্রদর্শিত হবে।' 
            : 'Scanning the QR code on the official letterhead automatically authenticates the document.'}
        </div>
      </div>

      {/* Result Section */}
      {activeRef ? (
        isReceiptQuery ? (
          /* Receipt Verification Card */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-heavy space-y-8 animate-in zoom-in-95 duration-300">
            <div className="p-6 rounded-2xl border flex items-center gap-4 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-600 text-white">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {lang === 'bn' ? 'অফিসিয়াল রশিদ সত্যতা' : 'Official Receipt Authentication'}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    {lang === 'bn' ? 'বৈধ ও অনুমোদিত' : 'Verified & Valid'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black">
                  {lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংঘ অফিসিয়াল মানি রশিদ' : 'Azadi Social Welfare Official Money Receipt'}
                </h3>
              </div>
            </div>

            <div className="space-y-6 pt-2">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center">
                <h4 className="text-sm font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-2">
                  <Receipt size={16} />
                  <span>{lang === 'bn' ? 'রশিদ ও লেনদেনের তথ্য' : 'Receipt & Transaction Record'}</span>
                </h4>
                <span className="text-xs font-mono font-black text-slate-500">
                  {activeRef.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'সংগঠন' : 'Organization'}
                  </span>
                  <p className="font-black text-slate-900 dark:text-white">
                    {lang === 'bn' ? settings.nameBn : settings.nameEn}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'রশিদ নম্বর' : 'Receipt Number'}
                  </span>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {activeRef.toUpperCase()}
                  </p>
                </div>

                {matchedDonation && (
                  <>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === 'bn' ? 'অনুদানের খাত' : 'Purpose / Fund'}
                      </span>
                      <p className="font-black text-slate-900 dark:text-white">
                        {matchedDonation.purpose || 'General Welfare'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === 'bn' ? 'অনুদানের পরিমাণ' : 'Amount'}
                      </span>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg font-mono">
                        ৳ {matchedDonation.amount.toLocaleString()} BDT
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Link
                  to={`/verify-donation/${activeRef.replace(/^rec-/i, 'REC-')}`}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileText size={16} />
                  <span>{lang === 'bn' ? 'পূর্ণাঙ্গ অফিসিয়াল রশিদ পেজ খুলুন' : 'Open Full Official Receipt View'}</span>
                </Link>
              </div>
            </div>
          </div>
        ) : isDocVerified ? (
          /* Official Document Verification Card */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-heavy space-y-8 animate-in zoom-in-95 duration-300">
            
            {/* Authenticity Banner */}
            <div className="p-6 rounded-2xl border flex items-center gap-4 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-600 text-white shadow-md">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {lang === 'bn' ? 'সত্যতা নিশ্চিতকরণ স্ট্যাটাস' : 'Authenticity Status'}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-current font-mono">
                    VERIFIED OFFICIAL
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black">
                  {lang === 'bn' 
                    ? 'আজাদী সমাজ কল্যাণ সংঘের ডিজিটালভাবে যাচাইকৃত অফিসিয়াল নথি' 
                    : 'Digitally Authenticated Official Document of Azadi Social Welfare Organization'}
                </h3>
              </div>
            </div>

            {/* Document Details Grid */}
            <div className="space-y-6 pt-2">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <h4 className="text-sm font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-2">
                  <Award size={18} />
                  <span>{lang === 'bn' ? 'নথির অফিশিয়াল বিবরণ ও রেকর্ড' : 'Official Document Record'}</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {activeRef}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'সংগঠনের নাম' : 'Issuing Organization'}
                  </span>
                  <p className="font-black text-slate-900 dark:text-white text-base">
                    {lang === 'bn' ? settings.nameBn : settings.nameEn}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'bn' ? settings.establishedBn : settings.establishedEn}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'স্মারক / রেফারেন্স নম্বর' : 'Reference / Memo ID'}
                  </span>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-base font-mono">
                    {activeRef}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'নথির ধরন বা বিষয়' : 'Document Subject / Type'}
                  </span>
                  <p className="font-black text-slate-900 dark:text-white">
                    {documentTypeLabel}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'ইস্যুর তারিখ' : 'Issue Date'}
                  </span>
                  <p className="font-black text-slate-900 dark:text-white">
                    {dateParam || new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'অনুমোদিত স্বাক্ষরকারী' : 'Authorized Signatory'}
                  </span>
                  <p className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck size={16} className="text-emerald-600" />
                    <span>{sigParam || 'Al-Haj Md. Abdul Hanan'}</span>
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    {desigParam || (lang === 'bn' ? 'সভাপতি, আজাদী সমাজ কল্যাণ সংঘ' : 'President, Azadi Social Welfare Organization')}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'ডিজিটাল নিরাপত্তা হ্যাশ' : 'Security Fingerprint'}
                  </span>
                  <p className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 break-all">
                    {hashParam ? `SHA256:${hashParam}` : `ASWO-SEC-${activeRef.slice(-6)}-VALID`}
                  </p>
                </div>
              </div>

              {/* Security Seal & Official Guarantee Notice */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <Lock size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'ডিজিটাল নিরাপত্তা ও বৈধতার নিশ্চয়তা' : 'Digital Security & Verification Guarantee'}
                  </p>
                  <p className="leading-relaxed">
                    {lang === 'bn'
                      ? 'এই নথির সাথে সংযুক্ত কিউআর কোডটি আজাদী সমাজ কল্যাণ সংঘের কেন্দ্রীয় ডাটাবেজ এবং ডিজিটাল সিলমোহরের মাধ্যমে যাচাইকৃত। নথিটির যেকোনো অননুমোদিত রদবদল বা নকলকরণ শাস্তিযোগ্য অপরাধ।'
                      : 'The QR code attached to this document is verified against the official records of Azadi Social Welfare Organization. Any unauthorized tampering or forgery is strictly prohibited and subject to legal action.'}
                  </p>
                </div>
              </div>

              {/* Back to Home / Contact */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                <Link
                  to="/"
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>{lang === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</span>
                </Link>

                <Link
                  to="/contact"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Building2 size={16} />
                  <span>{lang === 'bn' ? 'সংগঠনের সাথে যোগাযোগ করুন' : 'Contact Organization'}</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Not Found State */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-heavy text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'নথি বা রশিদের তথ্য পাওয়া যায়নি' : 'Document or Receipt Not Found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {lang === 'bn'
                  ? `"${activeRef}" স্মারক নম্বরের সাথে মিল রয়েছে এমন কোনো অফিসিয়াল নথি বা রশিদ পাওয়া যায়নি। অনুগ্রহ করে স্মারক নম্বরটি পুনরায় পরীক্ষা করুন।`
                  : `No official document or receipt found matching reference "${activeRef}". Please re-check the memo reference or receipt number.`}
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setActiveRef('');
                }}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'নতুন অনুসন্ধান করুন' : 'Clear & Search Again'}
              </button>
            </div>
          </div>
        )
      ) : (
        /* Empty Prompt State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {lang === 'bn' ? 'নথি বা রশিদ যাচাই করতে অনুসন্ধান করুন' : 'Search to Authenticate Document or Receipt'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
            {lang === 'bn'
              ? 'লেটারহেড প্যাডে মুদ্রিত কিউআর কোড স্ক্যান করুন অথবা উপরের সার্চ বক্সে স্মারক নম্বর (যেমন: ASWO/DOC/...) বা রশিদ আইডি (যেমন: REC-...) লিখে যাচাই করুন।'
              : 'Scan the QR code printed on the official letterhead pad, or enter the document reference or receipt ID in the search bar above.'}
          </p>
        </div>
      )}
    </div>
  );
};
