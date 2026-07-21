import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { DonationStatus } from '../types';
import { 
  PieChart, ShieldCheck, FileText, Download, CheckCircle2, 
  Layers, Heart, Building2, Calendar, Award, ExternalLink, Lock, Check, Clock
} from 'lucide-react';
import { parseLocalDate } from '../utils/parseLocalDate';
import { PageHero } from '../components/PageHero';
import { PageCTA } from '../components/PageCTA';

export const Transparency: React.FC = () => {
  const { lang, donations, events, settings } = useApp();
  const t = TRANSLATIONS[lang];

  // Approved real donations
  const approvedDonations = useMemo(() => {
    return donations.filter(d => d.status === DonationStatus.APPROVED);
  }, [donations]);

  const totalRaised = useMemo(() => {
    return approvedDonations.reduce((sum, d) => sum + d.amount, 0);
  }, [approvedDonations]);

  // Breakdown by purpose / category
  const purposeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    approvedDonations.forEach(d => {
      const p = d.purpose || 'General Welfare';
      map[p] = (map[p] || 0) + d.amount;
    });

    return Object.entries(map).map(([purpose, amount]) => ({
      purpose,
      amount,
      percentage: totalRaised > 0 ? Math.round((amount / totalRaised) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [approvedDonations, totalRaised]);

  // Real Active Campaigns derived from events or categories
  const campaigns = useMemo(() => {
    const list = events.slice(0, 4).map(e => ({
      id: e.id,
      titleBn: e.titleBn,
      titleEn: e.titleEn,
      category: e.category || 'Welfare Drive',
      date: e.date,
      locationBn: e.locationBn,
      locationEn: e.locationEn,
      image: e.image
    }));
    return list;
  }, [events]);

  const trustIndicators = [
    {
      titleBn: "ম্যানুয়াল মোবাইল ব্যালেন্স ভেরিফিকেশন",
      titleEn: "Manual Transaction Verification",
      descBn: "প্রতিটি অনুদানের ট্রানজেকশন আইডি সরাসরি মোবাইল ব্যাংকিং ও ব্যাংক স্টেটমেন্টের সাথে মিলিয়ে নিশ্চিত করা হয়।",
      descEn: "Every transaction ID is manually matched against live bank & mobile banking statement logs.",
      icon: <ShieldCheck size={24} className="text-emerald-500" />
    },
    {
      titleBn: "অফিসিয়াল কিউআর রিসিট",
      titleEn: "QR-Verified Official Receipts",
      descBn: "অনুমোদিত প্রতিটি অনুদানের জন্য কিউআর কোড যুক্ত ডিজিটাল অনুদান রিসিট স্বয়ংক্রিয়ভাবে প্রদান করা হয়।",
      descEn: "Every approved donation generates an instant digital receipt with scan-to-verify QR authentication.",
      icon: <FileText size={24} className="text-blue-500" />
    },
    {
      titleBn: "পাবলিক ট্র্যাকিং ও ইতিহাস",
      titleEn: "Public Receipt Verification",
      descBn: "গোপনীয়তা বজায় রেখে যেকোনো ব্যক্তি রিসিট আইডি ব্যবহার করে অনুদানের স্থিতি ও অনুমোদন পরীক্ষা করতে পারেন।",
      descEn: "Anyone can verify receipt validity and approval status while maintaining strict donor privacy.",
      icon: <Layers size={24} className="text-amber-500" />
    },
    {
      titleBn: "পরিচালনা পর্ষদের তদারকি",
      titleEn: "Executive Committee Oversight",
      descBn: "কার্যনির্বাহী পর্ষদ ও অর্থ সম্পাদকের যৌথ অনুমোদনে সকল তহবিল সমাজকল্যাণমূলক খাতে বণ্টন করা হয়।",
      descEn: "All funds are audited and allocated under direct authorization of the executive committee.",
      icon: <Award size={24} className="text-indigo-500" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 bengali animate-in fade-in duration-500">
      {/* Page Hero */}
      <PageHero
        icon={<PieChart size={20} />}
        badgeBn="জবাবদিহিতা ও আর্থিক স্বচ্ছতা"
        badgeEn="Financial Governance & Audits"
        titleBn="স্বচ্ছতা ও তহবিল বিবরণী"
        titleEn="Transparency & Fund Stewardship"
        subtitleBn="আজাদী সমাজ কল্যাণ সংঘের সংগৃহীত তহবিলের সঠিক হিসাব, বন্টন প্রক্রিয়া এবং সামাজিক নিরাপত্তা সুশাসন।"
        subtitleEn="Clear financial summaries, donation distribution records, and verified operational integrity."
        breadcrumbs={[
          { labelBn: "স্বচ্ছতা ও হিসাব", labelEn: "Transparency" }
        ]}
      />

      {/* Trust Indicators Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {trustIndicators.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 hover:shadow-heavy transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              {item.icon}
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              {lang === 'bn' ? item.titleBn : item.titleEn}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {lang === 'bn' ? item.descBn : item.descEn}
            </p>
          </div>
        ))}
      </div>

      {/* Financial Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white rounded-4xl p-8 sm:p-12 border border-blue-800/40 shadow-heavy mb-16">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
              {lang === 'bn' ? 'তহবিল ও বিতরণ সারাংশ (২০২৫-২০২৬)' : 'Donation Allocation Overview — 2025/2026'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {lang === 'bn' ? 'অনুমোদিত অনুদান ও প্রকল্প বন্টন' : 'Verified Financial Summary'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              {lang === 'bn'
                ? 'অনুমোদিত সকল অনুদান সম্পূর্ণ ব্যাংক ও মোবাইল ওয়ালেট স্টেটমেন্টের সাথে নিয়মিত সমন্বয় করা হয়।'
                : 'All verified public donations are cataloged and reconciled against organization accounts.'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-6 rounded-3xl border border-white/10 text-center shrink-0 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {lang === 'bn' ? 'মোট অনুমোদিত সংগৃহীত অর্থ' : 'Total Approved Raised'}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
              ৳ {totalRaised.toLocaleString()}
            </div>
            <span className="inline-block text-[9px] font-black uppercase text-blue-300 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-400/20">
              {lang === 'bn' ? `${approvedDonations.length} টি অনুমোদিত ট্রানজেকশন` : `${approvedDonations.length} Approved Transactions`}
            </span>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        {purposeBreakdown.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
              {lang === 'bn' ? 'খাতভিত্তিক অনুদান বণ্টন পরিস্থিতি' : 'Category-wise Fund Distribution'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {purposeBreakdown.map((item, idx) => (
                <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-white">{item.purpose}</span>
                    <span className="text-amber-400 font-mono">৳ {item.amount.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs font-bold">
            {lang === 'bn' ? 'বর্তমানে কোনো অনুমোদিত অনুদানের রেকর্ড নেই।' : 'No approved donation allocation records available yet.'}
          </div>
        )}
      </div>

      {/* Official Documents & Reports Section */}
      <div className="space-y-8 mb-16">
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-blue-700 dark:text-amber-400 tracking-widest">
            {lang === 'bn' ? 'অফিসিয়াল প্রকাশনা ও ফাইল' : 'Official Publications'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {lang === 'bn' ? 'সংগঠনের প্রতিবেদন ও দলিলপত্র' : 'Organizational Reports & Documents'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'bn'
              ? 'আজাদী সমাজ কল্যাণ সংঘের অনুমোদনপত্র, বার্ষিক রিপোর্ট ও নীতিমালার ডিজিটাল ফাইল।'
              : 'Official documents, annual review briefs, and constitutional declarations.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              titleBn: "সংগঠনের গঠনতন্ত্র ও গঠনবিধি",
              titleEn: "Organization Constitution & Bylaws",
              year: "1988 - Present",
              descBn: "সমাজসেবামূলক পরিচালনার মূল নীতি, বিধিমালা ও সামাজিক নিয়মাবলী।",
              descEn: "Foundational charter, operating principles and organizational guidelines."
            },
            {
              titleBn: "বার্ষিক সামাজিক কার্যক্রম রিপোর্ট ২০২৪",
              titleEn: "Annual Welfare Activity Report 2024",
              year: "2024",
              descBn: "বন্যা ত্রাণ, শিক্ষা স্কলারশিপ ও ক্রীড়া প্রতিযোগিতার পূর্ণাঙ্গ প্রতিবেদন।",
              descEn: "Comprehensive review of flood relief drives, sports events & microgrants."
            },
            {
              titleBn: "বার্ষিক আর্থিক হিসাব বিবরণী ২০২৪-২৫",
              titleEn: "Financial Overview Brief 2024-25",
              year: "2024-2025",
              descBn: "সংগৃহীত অনুদান, ত্রাণ বিতরণ ব্যয় ও সামাজিক ব্যয়ের সারসংক্ষেপ।",
              descEn: "Summary of income from public contributions and social welfare expenses."
            }
          ].map((doc, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col justify-between space-y-6 hover:shadow-heavy transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {doc.year}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {lang === 'bn' ? doc.titleBn : doc.titleEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {lang === 'bn' ? doc.descBn : doc.descEn}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-amber-400 uppercase tracking-wider">
                  <CheckCircle2 size={14} />
                  <span>{lang === 'bn' ? 'কার্যনির্বাহী পর্ষদ অনুমোদিত' : 'Executive Board Approved'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional CTA */}
      <PageCTA />
    </div>
  );
};
