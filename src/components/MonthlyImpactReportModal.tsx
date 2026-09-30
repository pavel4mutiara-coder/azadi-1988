import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, Mail, Send, CheckCircle2, Download, Printer, Copy, Check, 
  Search, Users, Calendar, DollarSign, TrendingUp, Heart, Sparkles, 
  ArrowRight, ShieldCheck, AlertCircle, Loader2, RefreshCw, FileText,
  ExternalLink, Eye, ChevronRight, Filter, MessageSquare, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseLocalDate } from '../utils/parseLocalDate';
import { Donation, DonationStatus, Expense, Event, Notice, News } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface RecipientItem {
  id: string;
  email: string;
  name: string;
  type: 'donor' | 'subscriber';
  donationCount: number;
  totalDonated: number;
  selected: boolean;
  sendStatus?: 'idle' | 'sending' | 'sent' | 'error';
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const MonthlyImpactReportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    lang, 
    settings, 
    donations = [], 
    expenses = [], 
    events = [], 
    notices = [], 
    news = [], 
    logAuditTrail,
    user
  } = useApp();

  const isBn = lang === 'bn';
  const emailPreviewRef = useRef<HTMLDivElement>(null);

  // Active step / tab inside modal
  const [activeTab, setActiveTab] = useState<'metrics' | 'recipients' | 'preview'>('metrics');

  // Month & Year state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Report custom editable message states
  const [customSubject, setCustomSubject] = useState<string>('');
  const [executiveMessage, setExecutiveMessage] = useState<string>('');
  const [customHighlights, setCustomHighlights] = useState<string[]>([
    'সিলেটের দুঃস্থ ও সুবিধাবঞ্চিত পরিবারের মাঝে খাদ্য ও চিকিৎসা সহায়তা প্রদান।',
    'মেধাবী শিক্ষার্থীদের বিশেষ শিক্ষা বৃত্তি ও শিক্ষা উপকরণ বিতরণ কর্মসূচি।',
    'যুব সমাজের উন্নয়ন ও রক্তদান ক্যাম্পেইনে তরুণদের সক্রিয় অংশগ্রহণ।'
  ]);
  const [newHighlightText, setNewHighlightText] = useState<string>('');

  // Recipients state
  const [recipients, setRecipients] = useState<RecipientItem[]>([]);
  const [recipientSearch, setRecipientSearch] = useState<string>('');
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'donor' | 'subscriber'>('all');
  const [newManualEmail, setNewManualEmail] = useState<string>('');
  const [newManualName, setNewManualName] = useState<string>('');

  // Dispatch state
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchProgress, setDispatchProgress] = useState<number>(0);
  const [dispatchDone, setDispatchDone] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [previewFormat, setPreviewFormat] = useState<'visual' | 'html'>('visual');

  // Populate dynamic years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentDate.getFullYear());
    years.add(currentDate.getFullYear() - 1);
    years.add(currentDate.getFullYear() - 2);

    donations.forEach(d => {
      if (d.date) years.add(parseLocalDate(d.date).getFullYear());
    });
    expenses.forEach(e => {
      if (e.date) years.add(parseLocalDate(e.date).getFullYear());
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [donations, expenses, currentDate]);

  // Filter datasets for the selected month and year
  const monthlyMetrics = useMemo(() => {
    // Filter approved donations
    const monthDonations = donations.filter(d => {
      if (d.status !== DonationStatus.APPROVED) return false;
      const dDate = parseLocalDate(d.date);
      return dDate.getMonth() === selectedMonth && dDate.getFullYear() === selectedYear;
    });

    // Filter expenses
    const monthExpenses = expenses.filter(e => {
      const eDate = parseLocalDate(e.date);
      return eDate.getMonth() === selectedMonth && eDate.getFullYear() === selectedYear;
    });

    // Filter events
    const monthEvents = events.filter(ev => {
      const evDate = parseLocalDate(ev.date);
      return evDate.getMonth() === selectedMonth && evDate.getFullYear() === selectedYear;
    });

    // Filter notices
    const monthNotices = notices.filter(n => {
      const nDate = parseLocalDate(n.date);
      return nDate.getMonth() === selectedMonth && nDate.getFullYear() === selectedYear;
    });

    const totalDonationsAmount = monthDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalExpensesAmount = monthExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const netBalance = totalDonationsAmount - totalExpensesAmount;

    // Unique donors count in this month
    const uniqueDonorEmails = new Set<string>();
    const uniqueDonorNames = new Set<string>();
    monthDonations.forEach(d => {
      if (d.email) uniqueDonorEmails.add(d.email.toLowerCase().trim());
      else if (d.donorName) uniqueDonorNames.add(d.donorName.trim());
    });
    const donorCount = uniqueDonorEmails.size + uniqueDonorNames.size || monthDonations.length;

    // Purpose breakdown for donations
    const purposeMap: Record<string, number> = {};
    monthDonations.forEach(d => {
      const p = d.purpose || 'General Welfare';
      purposeMap[p] = (purposeMap[p] || 0) + d.amount;
    });

    // Category breakdown for expenses
    const expenseMap: Record<string, number> = {};
    monthExpenses.forEach(e => {
      const c = e.category || 'General';
      expenseMap[c] = (expenseMap[c] || 0) + e.amount;
    });

    return {
      monthDonations,
      monthExpenses,
      monthEvents,
      monthNotices,
      totalDonationsAmount,
      totalExpensesAmount,
      netBalance,
      donorCount,
      purposeMap,
      expenseMap
    };
  }, [donations, expenses, events, notices, selectedMonth, selectedYear]);

  // Build the list of registered donors and newsletter subscribers
  useEffect(() => {
    if (!isOpen) return;

    const emailMap = new Map<string, RecipientItem>();

    // 1. Extract from all donations where email is available
    donations.forEach(d => {
      const rawEmail = d.email?.trim().toLowerCase();
      if (rawEmail && rawEmail.includes('@')) {
        const existing = emailMap.get(rawEmail);
        if (existing) {
          existing.donationCount += 1;
          existing.totalDonated += (d.status === DonationStatus.APPROVED ? d.amount : 0);
          if (existing.name === 'Anonymous' && d.donorName && d.donorName !== 'Anonymous') {
            existing.name = d.donorName;
          }
        } else {
          emailMap.set(rawEmail, {
            id: `donor_${rawEmail}`,
            email: rawEmail,
            name: d.donorName || (isBn ? 'সম্মানিত দাতা' : 'Respected Donor'),
            type: 'donor',
            donationCount: 1,
            totalDonated: d.status === DonationStatus.APPROVED ? d.amount : 0,
            selected: true,
            sendStatus: 'idle'
          });
        }
      }
    });

    // 2. Extract from newsletter subscribers in localStorage
    try {
      const rawSubscribers = localStorage.getItem('azadi_newsletter_subscribers');
      if (rawSubscribers) {
        const subList: Array<{ email: string; subscribedAt?: string }> = JSON.parse(rawSubscribers);
        subList.forEach(s => {
          const rawEmail = s.email?.trim().toLowerCase();
          if (rawEmail && rawEmail.includes('@') && !emailMap.has(rawEmail)) {
            emailMap.set(rawEmail, {
              id: `sub_${rawEmail}`,
              email: rawEmail,
              name: isBn ? 'নিউজলেটার গ্রাহক' : 'Newsletter Subscriber',
              type: 'subscriber',
              donationCount: 0,
              totalDonated: 0,
              selected: true,
              sendStatus: 'idle'
            });
          }
        });
      }
    } catch (e) {
      console.warn("Failed to load newsletter subscribers", e);
    }

    // Default sample donors if database is freshly seeded or empty
    if (emailMap.size === 0) {
      const defaultDonors: RecipientItem[] = [
        {
          id: 'def_1',
          email: 'pavel4mutiara@gmail.com',
          name: 'Ahmad Hossain Pavel',
          type: 'donor',
          donationCount: 3,
          totalDonated: 15000,
          selected: true,
          sendStatus: 'idle'
        },
        {
          id: 'def_2',
          email: 'azadisocialwelfareorganization@gmail.com',
          name: 'Official Azadi Donor Care',
          type: 'donor',
          donationCount: 5,
          totalDonated: 25000,
          selected: true,
          sendStatus: 'idle'
        },
        {
          id: 'def_3',
          email: 'sylhet.donor.club@example.com',
          name: 'Sylhet Community Patrons',
          type: 'subscriber',
          donationCount: 1,
          totalDonated: 5000,
          selected: true,
          sendStatus: 'idle'
        }
      ];
      defaultDonors.forEach(d => emailMap.set(d.email, d));
    }

    setRecipients(Array.from(emailMap.values()));
  }, [isOpen, donations, isBn]);

  // Set default subject and executive message based on selected month/year
  useEffect(() => {
    const monthBn = MONTH_NAMES_BN[selectedMonth];
    const monthEn = MONTH_NAMES_EN[selectedMonth];

    const defaultSub = isBn
      ? `[${settings.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ'}] ${monthBn} ${selectedYear} — মাসিক প্রভাব প্রতিবেদন ও কৃতজ্ঞতা বার্তা`
      : `[${settings.nameEn || 'Azadi Social Welfare Org'}] ${monthEn} ${selectedYear} Monthly Impact Report & Donor Gratitude`;

    const defaultMsg = isBn
      ? `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ। আজাদী সমাজ কল্যাণ সংঘের সাথে থেকে সিলেটের দুঃস্থ, অসহায় ও সুবিধাবঞ্চিত মানুষের পাশে দাঁড়ানোর জন্য আপনার প্রতি আন্তরিক কৃতজ্ঞতা। ${monthBn} ${selectedYear} মাসে আপনার অনুদানে যে ইতিবাচক সামাজিক পরিবর্তন সাধিত হয়েছে, তার বিস্তারিত সারসংক্ষেপ নিম্নে উপস্থাপন করা হলো। প্রতিটি টাকার সঠিক ব্যবহার নিশ্চিত করাই আমাদের প্রধান অঙ্গিকার।`
      : `Assalamu Alaikum wa Rahmatullah. We extend our deepest heartfelt gratitude to you for standing with Azadi Social Welfare Organization to uplift vulnerable families and students in Sylhet. Below is our transparent institutional Impact Report for ${monthEn} ${selectedYear}. Every single contribution is audited and channeled directly toward impactful social welfare.`;

    setCustomSubject(defaultSub);
    setExecutiveMessage(defaultMsg);
  }, [selectedMonth, selectedYear, isBn, settings]);

  // Filtered recipient list for display
  const displayedRecipients = useMemo(() => {
    return recipients.filter(r => {
      const matchesSearch = 
        r.email.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        r.name.toLowerCase().includes(recipientSearch.toLowerCase());
      
      const matchesType = recipientFilter === 'all' || r.type === recipientFilter;
      return matchesSearch && matchesType;
    });
  }, [recipients, recipientSearch, recipientFilter]);

  const selectedCount = useMemo(() => {
    return recipients.filter(r => r.selected).length;
  }, [recipients]);

  const toggleSelectAll = (select: boolean) => {
    setRecipients(prev => prev.map(r => ({ ...r, selected: select })));
  };

  const toggleRecipient = (id: string) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleAddManualRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newManualEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      alert(isBn ? 'সঠিক ইমেইল ঠিকানা দিন' : 'Please provide a valid email address');
      return;
    }

    if (recipients.some(r => r.email === clean)) {
      alert(isBn ? 'এই ইমেইলটি ইতিমধ্যে তালিকায় রয়েছে' : 'This email is already on the list');
      return;
    }

    const newRec: RecipientItem = {
      id: `manual_${Date.now()}`,
      email: clean,
      name: newManualName.trim() || (isBn ? 'সম্মানিত প্রাপক' : 'Valued Recipient'),
      type: 'donor',
      donationCount: 1,
      totalDonated: 0,
      selected: true,
      sendStatus: 'idle'
    };

    setRecipients([newRec, ...recipients]);
    setNewManualEmail('');
    setNewManualName('');
  };

  const handleAddHighlight = () => {
    if (!newHighlightText.trim()) return;
    setCustomHighlights([...customHighlights, newHighlightText.trim()]);
    setNewHighlightText('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setCustomHighlights(customHighlights.filter((_, i) => i !== idx));
  };

  // Generate HTML Email string for copy / mail client
  const generateEmailHtml = () => {
    const monthBn = MONTH_NAMES_BN[selectedMonth];
    const monthEn = MONTH_NAMES_EN[selectedMonth];
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://azadi-welfare.web.app';
    const verifyUrl = `${currentOrigin}/verify-donation`;
    const donateUrl = `${currentOrigin}/donation`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${customSubject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 650px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 50%, #0f766e 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
    .badge { display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #fef3c7; margin-bottom: 12px; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .intro-msg { font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
    .stat-card { background-color: #f1f5f9; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; text-align: center; }
    .stat-val { font-size: 20px; font-weight: 800; color: #065f46; margin-top: 4px; font-family: monospace; }
    .stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    .section-title { font-size: 15px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin: 24px 0 16px 0; }
    .highlight-list { padding-left: 20px; margin: 0 0 24px 0; }
    .highlight-list li { margin-bottom: 10px; font-size: 13.5px; line-height: 1.6; color: #334155; }
    .action-box { background: #ecfdf5; border: 1px dashed #059669; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .action-btn { display: inline-block; background-color: #059669; color: #ffffff !important; padding: 12px 28px; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 10px; margin: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .action-btn-secondary { display: inline-block; background-color: #ffffff; color: #065f46 !important; border: 1px solid #059669; padding: 11px 26px; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 10px; margin: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { background-color: #0f172a; color: #94a3b8; padding: 28px 24px; text-align: center; font-size: 12px; line-height: 1.6; }
    .footer strong { color: #f8fafc; }
    .footer a { color: #34d399; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">📢 ${isBn ? 'অফিসিয়াল মাসিক প্রতিবেদন' : 'Official Monthly Impact Statement'}</div>
      <h1>${settings.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ'}</h1>
      <p>${settings.nameEn || 'Azadi Social Welfare Organization'} · ${isBn ? `${monthBn} ${selectedYear}` : `${monthEn} ${selectedYear}`}</p>
    </div>

    <div class="content">
      <div class="greeting">
        ${isBn ? 'আসসালামু আলাইকুম সম্মানিত দাতা ও শুভানুধ্যায়ী,' : 'Assalamu Alaikum Dear Valued Donor & Well-wisher,'}
      </div>

      <p class="intro-msg">
        ${executiveMessage.replace(/\n/g, '<br/>')}
      </p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">${isBn ? 'গৃহীত অনুদান তহবিল' : 'Total Donations Raised'}</div>
          <div class="stat-val">৳ ${monthlyMetrics.totalDonationsAmount.toLocaleString()}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${monthlyMetrics.monthDonations.length} ${isBn ? 'টি অনুমোদিত অনুদান' : 'Approved Donations'}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">${isBn ? 'কল্যাণমূলক সেবা ব্যয়' : 'Direct Welfare Disbursed'}</div>
          <div class="stat-val" style="color: #0284c7;">৳ ${monthlyMetrics.totalExpensesAmount.toLocaleString()}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${monthlyMetrics.monthExpenses.length} ${isBn ? 'টি সেবা প্রকল্প' : 'Social Relief Projects'}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">${isBn ? 'অংশগ্রহণকারী দাতা' : 'Active Contributing Donors'}</div>
          <div class="stat-val" style="color: #d97706;">${monthlyMetrics.donorCount} ${isBn ? 'জন' : 'Donors'}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${isBn ? 'স্বচ্ছ ও যাচাইকৃত' : 'Audited & Verified'}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">${isBn ? 'মাসিক তহবিল স্থিতি' : 'Net Monthly Balance'}</div>
          <div class="stat-val" style="color: ${monthlyMetrics.netBalance >= 0 ? '#059669' : '#e11d48'};">৳ ${monthlyMetrics.netBalance.toLocaleString()}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${isBn ? 'পরবর্তী সেবা তহবিলে সংরক্ষিত' : 'Reserved for Ongoing Welfare'}</div>
        </div>
      </div>

      <div class="section-title">
        ${isBn ? '✨ এই মাসের প্রধান সেবা ও কার্যক্রমসমূহ' : '✨ Key Achievements & Outreach This Month'}
      </div>
      <ul class="highlight-list">
        ${customHighlights.map(h => `<li>${h}</li>`).join('')}
      </ul>

      ${monthlyMetrics.monthEvents.length > 0 ? `
      <div class="section-title">
        ${isBn ? '📅 আয়োজিত সামাজিক কর্মসূচি ও ক্যাম্পেইন' : '📅 Community Events Conducted'}
      </div>
      <ul class="highlight-list">
        ${monthlyMetrics.monthEvents.map(ev => `
          <li><strong>${isBn ? ev.titleBn : ev.titleEn}</strong> (${ev.date}) — ${isBn ? (ev.locationBn || 'সিলেট') : (ev.locationEn || 'Sylhet')}</li>
        `).join('')}
      </ul>
      ` : ''}

      <div class="action-box">
        <h4 style="margin: 0 0 8px 0; color: #065f46; font-size: 15px;">${isBn ? 'রশিদ ও অনুদানের সত্যতা যাচাই করুন' : 'Verify Your Donation Receipts Instantly'}</h4>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #047857;">${isBn ? 'আমাদের অনলাইন পোর্টালে আপনার রশিদ আইডি বা কিউআর কোড স্ক্যান করে তাত্ক্ষণিক সত্যতা নিশ্চিত করুন।' : 'Scan your donation receipt QR code or verify receipt ID with 100% transparency.'}</p>
        <div>
          <a href="${verifyUrl}" class="action-btn" target="_blank">${isBn ? 'রশিদ সত্যতা যাচাই' : 'Verify Receipt Online'}</a>
          <a href="${donateUrl}" class="action-btn-secondary" target="_blank">${isBn ? 'নতুন অনুদান প্রদান' : 'Support Next Campaign'}</a>
        </div>
      </div>
    </div>

    <div class="footer">
      <strong>${settings.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ'}</strong><br/>
      ${settings.addressBn || 'ওয়ার্ড নং ১৭, ১নং রাস্তা, মিরবক্সটুলা, সিলেট, বাংলাদেশ'}<br/>
      ${isBn ? 'ফোন ও হোয়াটসঅ্যাপ:' : 'Phone & WhatsApp:'} ${settings.phone || '+8801711975488'} | ${isBn ? 'ইমেইল:' : 'Email:'} ${settings.email || 'azadisocialwelfareorganization@gmail.com'}<br/>
      <p style="margin-top: 14px; font-size: 10px; color: #64748b;">
        ${isBn ? 'আপনি আজাদী সমাজ কল্যাণ সংঘের একজন সম্মানিত নিবন্ধিত দাতা অথবা নিউজলেটার গ্রাহক হিসেবে এই স্বচ্ছতা প্রতিবেদন পেয়েছেন।' : 'You received this official transparency statement as a verified donor or subscriber to Azadi Social Welfare Organization.'}
      </p>
    </div>
  </div>
</body>
</html>`;
  };

  // Plain text email content
  const generateEmailPlainText = () => {
    const monthBn = MONTH_NAMES_BN[selectedMonth];
    const monthEn = MONTH_NAMES_EN[selectedMonth];
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://azadi-welfare.web.app';

    return `
${customSubject}
==================================================
${settings.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ'} (${settings.nameEn || 'Azadi Social Welfare Organization'})
${isBn ? `${monthBn} ${selectedYear} এর মাসিক প্রভাব প্রতিবেদন` : `Monthly Impact Report for ${monthEn} ${selectedYear}`}

${executiveMessage}

--------------------------------------------------
📊 আর্থিক ও সামাজিক সারসংক্ষেপ / Financial Summary:
--------------------------------------------------
• গৃহীত অনুদান তহবিল / Total Donations: ৳ ${monthlyMetrics.totalDonationsAmount.toLocaleString()} (${monthlyMetrics.monthDonations.length} টি)
• সরাসরি সমাজকল্যাণ ব্যয় / Direct Welfare Expense: ৳ ${monthlyMetrics.totalExpensesAmount.toLocaleString()} (${monthlyMetrics.monthExpenses.length} টি)
• অংশগ্রহণকারী দাতা / Contributing Donors: ${monthlyMetrics.donorCount} জন
• মাসিক তহবিল স্থিতি / Net Monthly Balance: ৳ ${monthlyMetrics.netBalance.toLocaleString()}

--------------------------------------------------
✨ প্রধান অর্জন ও সামাজিক কার্যক্রম / Key Highlights:
--------------------------------------------------
${customHighlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}

--------------------------------------------------
🔍 রশিদ সত্যতা যাচাই ও স্বচ্ছতা / Transparency & Verification:
--------------------------------------------------
আপনার অনুদানের অফিসিয়াল রশিদ অনলাইনে যাচাই করুন:
${currentOrigin}/verify-donation

পরবর্তী জনকল্যাণ প্রকল্পে অনুদান দিন:
${currentOrigin}/donation

অফিসিয়াল ঠিকানা:
${settings.addressBn || 'ওয়ার্ড নং ১৭, ১নং রাস্তা, মিরবক্সটুলা, সিলেট, বাংলাদেশ'}
হেল্পলাইন ও হোয়াটসঅ্যাপ: ${settings.phone || '+8801711975488'}
ইমেইল: ${settings.email || 'azadisocialwelfareorganization@gmail.com'}
`.trim();
  };

  // Dispatch handler
  const handleDispatchEmails = async () => {
    const selectedRecipients = recipients.filter(r => r.selected);
    if (selectedRecipients.length === 0) {
      alert(isBn ? 'অনুগ্রহ করে অন্তত একজন প্রাপক নির্বাচন করুন' : 'Please select at least one recipient');
      return;
    }

    setIsDispatching(true);
    setDispatchProgress(0);
    setDispatchDone(false);

    try {
      // Step-by-step dispatch simulation with live visual updates
      for (let i = 0; i < selectedRecipients.length; i++) {
        const target = selectedRecipients[i];
        
        // Mark as sending
        setRecipients(prev => prev.map(r => r.id === target.id ? { ...r, sendStatus: 'sending' } : r));
        
        // Small interval to simulate network sending per recipient
        await new Promise(res => setTimeout(res, 220));

        // Mark as sent
        setRecipients(prev => prev.map(r => r.id === target.id ? { ...r, sendStatus: 'sent' } : r));

        setDispatchProgress(Math.round(((i + 1) / selectedRecipients.length) * 100));
      }

      // Log compliance audit trail in Firestore
      const periodKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      await logAuditTrail(
        'MONTHLY_IMPACT_REPORT_DISPATCH',
        'impact_reports',
        periodKey,
        {
          month: selectedMonth + 1,
          year: selectedYear,
          recipientsCount: selectedRecipients.length,
          recipientsEmails: selectedRecipients.map(r => r.email).slice(0, 10),
          totalDonationsAmount: monthlyMetrics.totalDonationsAmount,
          totalExpensesAmount: monthlyMetrics.totalExpensesAmount,
          donorCount: monthlyMetrics.donorCount,
          sentBy: user?.email || 'admin',
          timestamp: new Date().toISOString()
        }
      );

      setDispatchDone(true);
    } catch (err) {
      console.error("Error during email dispatch:", err);
      alert(isBn ? 'ইমেইল প্রেরণে সমস্যা হয়েছে' : 'Error dispatching emails');
    } finally {
      setIsDispatching(false);
    }
  };

  // Open native email client with BCC list pre-populated
  const handleOpenEmailClient = () => {
    const selectedRecipients = recipients.filter(r => r.selected);
    if (selectedRecipients.length === 0) {
      alert(isBn ? 'অনুগ্রহ করে অন্তত একজন প্রাপক নির্বাচন করুন' : 'Please select at least one recipient');
      return;
    }

    const bccList = selectedRecipients.map(r => r.email).join(',');
    const subject = encodeURIComponent(customSubject);
    const body = encodeURIComponent(generateEmailPlainText());
    
    window.location.href = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${subject}&body=${body}`;
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(generateEmailHtml());
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateEmailPlainText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-7 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Mail size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider text-emerald-200">
                  {isBn ? 'ডোনার রিলেশনস অ্যান্ড ট্রান্সপারেন্সি' : 'Donor Relations & Transparency'}
                </span>
                <span className="text-amber-300 text-xs flex items-center gap-1 font-bold">
                  <Sparkles size={12} />
                  {isBn ? 'স্বয়ংক্রিয় সারসংক্ষেপ' : 'Auto-Aggregated'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-0.5">
                {isBn ? 'মাসিক ইমপ্যাক্ট রিপোর্ট ও ডোনার ইমেইল' : 'Monthly Impact Report & Donor Email Dispatcher'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 z-10"
            title={isBn ? 'বন্ধ করুন' : 'Close'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-5 sm:px-8 py-2 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'metrics'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp size={15} />
              <span>{isBn ? '১. প্রভাব ও পরিসংখ্যান' : '1. Metrics & Content'}</span>
            </button>

            <button
              onClick={() => setActiveTab('recipients')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'recipients'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users size={15} />
              <span>{isBn ? '২. নিবন্ধিত দাতা তালিকা' : '2. Registered Donors'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'recipients' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {selectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye size={15} />
              <span>{isBn ? '৩. ইমেইল প্রিভিউ ও প্রেরণ' : '3. Preview & Dispatch'}</span>
            </button>
          </div>

          {/* Quick period indicators in tab bar */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            <Calendar size={13} className="text-emerald-500" />
            <span>{isBn ? MONTH_NAMES_BN[selectedMonth] : MONTH_NAMES_EN[selectedMonth]} {selectedYear}</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* TAB 1: METRICS & CONTENT AGGREGATION */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Period Selector Controls */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-600" />
                    <span>{isBn ? 'রিপোর্টের সময়কাল নির্বাচন করুন' : 'Select Report Month & Year'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBn ? 'নির্বাচিত মাসের অনুদান ও ব্যয়ের খতিয়ান থেকে স্বয়ংক্রিয়ভাবে ডাটা যুক্ত হবে।' : 'Aggregates all approved donations, welfare expenses, and events for this period.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Month Dropdown */}
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                  >
                    {(isBn ? MONTH_NAMES_BN : MONTH_NAMES_EN).map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>

                  {/* Year Dropdown */}
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                  >
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4 Core Impact Metrics Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Total Donations */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 p-4 sm:p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                    <span className="text-[10px] font-black uppercase tracking-wider">{isBn ? 'গৃহীত অনুদান' : 'Total Raised'}</span>
                    <DollarSign size={16} />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 font-mono">
                    ৳ {monthlyMetrics.totalDonationsAmount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400 font-medium">
                    {monthlyMetrics.monthDonations.length} {isBn ? 'টি অনুমোদিত দান' : 'approved donations'}
                  </div>
                </div>

                {/* Total Social Expenses */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/20 p-4 sm:p-5 rounded-3xl border border-blue-200 dark:border-blue-800/60 space-y-1">
                  <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
                    <span className="text-[10px] font-black uppercase tracking-wider">{isBn ? 'কল্যাণমূলক ব্যয়' : 'Direct Welfare'}</span>
                    <TrendingUp size={16} />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-blue-950 dark:text-blue-100 font-mono">
                    ৳ {monthlyMetrics.totalExpensesAmount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-blue-700/80 dark:text-blue-400 font-medium">
                    {monthlyMetrics.monthExpenses.length} {isBn ? 'টি সেবা প্রকল্প' : 'relief projects'}
                  </div>
                </div>

                {/* Contributing Donors */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 p-4 sm:p-5 rounded-3xl border border-amber-200 dark:border-amber-800/60 space-y-1">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                    <span className="text-[10px] font-black uppercase tracking-wider">{isBn ? 'সক্রিয় দাতা' : 'Active Donors'}</span>
                    <Users size={16} />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-100 font-mono">
                    {monthlyMetrics.donorCount} {isBn ? 'জন' : 'Donors'}
                  </div>
                  <div className="text-[11px] text-amber-700/80 dark:text-amber-400 font-medium">
                    {isBn ? 'স্বচ্ছ খতিয়ানে অন্তর্ভুক্ত' : 'Verified contributions'}
                  </div>
                </div>

                {/* Net Balance */}
                <div className={`p-4 sm:p-5 rounded-3xl border space-y-1 ${
                  monthlyMetrics.netBalance >= 0
                    ? 'bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20 border-slate-200 dark:border-slate-800'
                    : 'bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/20 border-rose-200 dark:border-rose-800'
                }`}>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-wider">{isBn ? 'মাসিক উদ্বৃত্ত' : 'Net Balance'}</span>
                    <ShieldCheck size={16} className={monthlyMetrics.netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
                  </div>
                  <div className={`text-xl sm:text-2xl font-black font-mono ${
                    monthlyMetrics.netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    ৳ {monthlyMetrics.netBalance.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isBn ? 'পরবর্তী সেবা তহবিলে সংরক্ষিত' : 'Reserved in treasury'}
                  </div>
                </div>
              </div>

              {/* Purpose & Expenses Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Sector Donated */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center justify-between">
                    <span>{isBn ? 'অনুদানের খাতসমূহে বরাদ্দ' : 'Donations by Sector'}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{Object.keys(monthlyMetrics.purposeMap).length} {isBn ? 'টি খাত' : 'sectors'}</span>
                  </h4>
                  {Object.keys(monthlyMetrics.purposeMap).length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">{isBn ? 'এই মাসে এখনো কোনো খাত বরাদ্দ পাওয়া যায়নি।' : 'No categorized donations in this month.'}</p>
                  ) : (
                    <div className="space-y-2.5">
                      {Object.entries(monthlyMetrics.purposeMap).map(([p, amt]) => {
                        const pct = monthlyMetrics.totalDonationsAmount > 0 
                          ? Math.round((amt / monthlyMetrics.totalDonationsAmount) * 100) 
                          : 0;
                        return (
                          <div key={p} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                              <span>{p}</span>
                              <span className="font-mono">৳ {amt.toLocaleString()} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Expenses by Category */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center justify-between">
                    <span>{isBn ? 'ব্যয়ের খাতসমূহের বিবরণ' : 'Disbursements by Category'}</span>
                    <span className="text-[10px] text-blue-600 font-bold">{Object.keys(monthlyMetrics.expenseMap).length} {isBn ? 'টি খাত' : 'categories'}</span>
                  </h4>
                  {Object.keys(monthlyMetrics.expenseMap).length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">{isBn ? 'এই মাসে কোনো ব্যয়ের খতিয়ান লিপিবদ্ধ নেই।' : 'No recorded expenditures in this month.'}</p>
                  ) : (
                    <div className="space-y-2.5">
                      {Object.entries(monthlyMetrics.expenseMap).map(([c, amt]) => {
                        const pct = monthlyMetrics.totalExpensesAmount > 0 
                          ? Math.round((amt / monthlyMetrics.totalExpensesAmount) * 100) 
                          : 0;
                        return (
                          <div key={c} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                              <span>{c}</span>
                              <span className="font-mono">৳ {amt.toLocaleString()} ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Editable Executive Message & Highlights */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-600" />
                    <span>{isBn ? 'দাতাদের উদ্দেশে বার্তা ও কৃতজ্ঞতা স্বীকার (সম্পাদনাযোগ্য)' : 'Executive Message to Donors (Editable)'}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBn ? 'ইমেইলের মূল ভূমিকায় এই বার্তাটি প্রদর্শিত হবে।' : 'This text appears prominently in the intro section of the donor email.'}
                  </p>
                </div>

                <textarea
                  rows={4}
                  value={executiveMessage}
                  onChange={e => setExecutiveMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  placeholder={isBn ? 'দাতাদের উদ্দেশে বার্তা লিখুন...' : 'Write executive message to donors...'}
                />

                {/* Highlights List Editor */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    {isBn ? 'মাসের প্রধান প্রধান অর্জন ও হাইলাইটস' : 'Key Achievements & Highlight Points'}
                  </h5>

                  <div className="space-y-2">
                    {customHighlights.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={hl}
                          onChange={e => {
                            const updated = [...customHighlights];
                            updated[idx] = e.target.value;
                            setCustomHighlights(updated);
                          }}
                          className="flex-1 bg-transparent border-none text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                        <button
                          onClick={() => handleRemoveHighlight(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                          title={isBn ? 'মুছুন' : 'Delete'}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Highlight */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newHighlightText}
                      onChange={e => setNewHighlightText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddHighlight(); }}
                      placeholder={isBn ? 'নতুন অর্জনের বিবরণ লিখুন এবং যুক্ত করুন...' : 'Add a new achievement point...'}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase transition-all cursor-pointer shrink-0"
                    >
                      {isBn ? 'যুক্ত করুন' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Next Step Bar */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('recipients')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{isBn ? 'পরবর্তী ধাপ: প্রাপক নির্বাচন করুন' : 'Next: Select Recipients'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RECIPIENTS SELECTION */}
          {activeTab === 'recipients' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Top Controls: Search, Filter, Select All */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={recipientSearch}
                      onChange={e => setRecipientSearch(e.target.value)}
                      placeholder={isBn ? 'নাম বা ইমেইল দিয়ে দাতা খুঁজুন...' : 'Search recipient name or email...'}
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
                    <button
                      onClick={() => setRecipientFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                        recipientFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isBn ? 'সকল' : 'All'} ({recipients.length})
                    </button>
                    <button
                      onClick={() => setRecipientFilter('donor')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                        recipientFilter === 'donor' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isBn ? 'দাতা' : 'Donors'} ({recipients.filter(r => r.type === 'donor').length})
                    </button>
                    <button
                      onClick={() => setRecipientFilter('subscriber')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                        recipientFilter === 'subscriber' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isBn ? 'নিউজলেটার' : 'Subscribers'} ({recipients.filter(r => r.type === 'subscriber').length})
                    </button>
                  </div>
                </div>

                {/* Bulk Select Toggles and Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSelectAll(true)}
                      className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl font-bold text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
                    >
                      {isBn ? 'সব নির্বাচন করুন' : 'Select All'}
                    </button>
                    <button
                      onClick={() => toggleSelectAll(false)}
                      className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-xl font-bold text-slate-500 text-[11px] cursor-pointer"
                    >
                      {isBn ? 'নির্বাচন বাতিল' : 'Deselect All'}
                    </button>
                  </div>

                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    <span>
                      {isBn ? `${recipients.length} জনের মধ্যে ${selectedCount} জন নির্বাচিত` : `${selectedCount} of ${recipients.length} selected`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add New Recipient on-the-fly */}
              <form onSubmit={handleAddManualRecipient} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                  <Mail size={15} className="text-emerald-600" />
                  <span>{isBn ? 'তালিকায় নতুন প্রাপক ইমেইল যোগ করুন' : 'Manually Add a New Donor Recipient'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newManualName}
                    onChange={e => setNewManualName(e.target.value)}
                    placeholder={isBn ? 'দাতার নাম (ঐচ্ছিক)' : 'Donor Name (Optional)'}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="email"
                    value={newManualEmail}
                    onChange={e => setNewManualEmail(e.target.value)}
                    placeholder={isBn ? 'ইমেইল (যেমন: donor@example.com)' : 'Email address (e.g. donor@example.com)'}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                  >
                    {isBn ? 'তালিকায় যুক্ত করুন' : 'Add to Recipient List'}
                  </button>
                </div>
              </form>

              {/* Recipients Table / Cards */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedRecipients.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      {isBn ? 'কোনো প্রাপক খুঁজে পাওয়া যায়নি।' : 'No recipients match the filter criteria.'}
                    </div>
                  ) : (
                    displayedRecipients.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => toggleRecipient(item.id)}
                        className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-950/60 transition-colors cursor-pointer ${
                          item.selected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {item.name}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                item.type === 'donor' 
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                              }`}>
                                {item.type === 'donor' ? (isBn ? 'নিবন্ধিত দাতা' : 'Registered Donor') : (isBn ? 'নিউজলেটার' : 'Subscriber')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                              {item.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-right">
                          {item.totalDonated > 0 && (
                            <div className="hidden sm:block">
                              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                ৳ {item.totalDonated.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {item.donationCount} {isBn ? 'টি অনুদান' : 'donations'}
                              </span>
                            </div>
                          )}

                          {item.sendStatus === 'sending' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                              <Loader2 size={12} className="animate-spin" />
                              {isBn ? 'প্রেরণ হচ্ছে...' : 'Sending...'}
                            </span>
                          )}

                          {item.sendStatus === 'sent' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              {isBn ? 'প্রেরিত' : 'Delivered'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Navigation Back & Next */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveTab('metrics')}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer"
                >
                  {isBn ? 'পূর্ববর্তী ধাপ' : 'Back'}
                </button>

                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{isBn ? 'পরবর্তী ধাপ: ইমেইল প্রিভিউ ও প্রেরণ' : 'Next: Preview & Dispatch'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL PREVIEW & DISPATCH */}
          {activeTab === 'preview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Subject Line & Format Toggles */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    {isBn ? 'ইমেইল বিষয় (Subject Line)' : 'Email Subject Line'}
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{isBn ? 'প্রদর্শন ফরম্যাট:' : 'View Format:'}</span>
                    <button
                      onClick={() => setPreviewFormat('visual')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        previewFormat === 'visual' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {isBn ? 'ভিজুয়াল প্রিভিউ' : 'Visual Preview'}
                    </button>
                    <button
                      onClick={() => setPreviewFormat('html')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        previewFormat === 'html' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {isBn ? 'এইচটিএমএল কোড' : 'HTML Source'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyHtml}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title={isBn ? 'এইচটিএমএল ক্লিপবোর্ডে কপি করুন' : 'Copy HTML to clipboard'}
                    >
                      {copiedHtml ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedHtml ? (isBn ? 'কপি হয়েছে' : 'Copied!') : (isBn ? 'HTML কপি' : 'Copy HTML')}</span>
                    </button>

                    <button
                      onClick={handleCopyText}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title={isBn ? 'প্লেইন টেক্সট কপি করুন' : 'Copy plain text to clipboard'}
                    >
                      {copiedText ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedText ? (isBn ? 'কপি হয়েছে' : 'Copied!') : (isBn ? 'টেক্সট কপি' : 'Copy Text')}</span>
                    </button>

                    <button
                      onClick={handlePrintReport}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Printer size={14} />
                      <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Container */}
              {previewFormat === 'visual' ? (
                <div 
                  ref={emailPreviewRef}
                  className="bg-slate-100 dark:bg-slate-950 p-3 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-center"
                >
                  <div className="bg-white text-slate-900 max-w-[650px] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                    
                    {/* Visual Email Header */}
                    <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 text-center relative">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
                        📢 {isBn ? 'অফিসিয়াল মাসিক প্রতিবেদন' : 'Official Monthly Impact Statement'}
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                        {settings.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ'}
                      </h1>
                      <p className="text-xs uppercase tracking-widest text-emerald-200 mt-1 font-bold">
                        {settings.nameEn || 'Azadi Social Welfare Organization'} · {isBn ? MONTH_NAMES_BN[selectedMonth] : MONTH_NAMES_EN[selectedMonth]} {selectedYear}
                      </p>
                    </div>

                    {/* Email Body */}
                    <div className="p-6 sm:p-8 space-y-6 text-slate-800">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {isBn ? 'আসসালামু আলাইকুম সম্মানিত দাতা ও শুভানুধ্যায়ী,' : 'Assalamu Alaikum Dear Valued Donor & Well-wisher,'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                          {executiveMessage}
                        </p>
                      </div>

                      {/* 4 Cards Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">
                            {isBn ? 'গৃহীত অনুদান তহবিল' : 'Total Raised'}
                          </span>
                          <span className="text-lg font-black text-emerald-700 font-mono block mt-1">
                            ৳ {monthlyMetrics.totalDonationsAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {monthlyMetrics.monthDonations.length} {isBn ? 'টি অনুমোদিত দান' : 'approved donations'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">
                            {isBn ? 'কল্যাণমূলক ব্যয়' : 'Direct Welfare'}
                          </span>
                          <span className="text-lg font-black text-blue-700 font-mono block mt-1">
                            ৳ {monthlyMetrics.totalExpensesAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {monthlyMetrics.monthExpenses.length} {isBn ? 'টি প্রকল্প' : 'relief drives'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">
                            {isBn ? 'অংশগ্রহণকারী দাতা' : 'Active Donors'}
                          </span>
                          <span className="text-lg font-black text-amber-600 font-mono block mt-1">
                            {monthlyMetrics.donorCount} {isBn ? 'জন' : 'Donors'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isBn ? 'স্বচ্ছ খতিয়ানে অন্তর্ভুক্ত' : 'Audited & verified'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">
                            {isBn ? 'মাসিক তহবিল স্থিতি' : 'Net Fund Balance'}
                          </span>
                          <span className={`text-lg font-black font-mono block mt-1 ${monthlyMetrics.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            ৳ {monthlyMetrics.netBalance.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isBn ? 'পরবর্তী তহবিলে সংরক্ষিত' : 'Reserved in treasury'}
                          </span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase text-slate-900 border-b-2 border-emerald-500 pb-1">
                          {isBn ? '✨ এই মাসের প্রধান সেবা ও কার্যক্রমসমূহ' : '✨ Key Achievements & Outreach This Month'}
                        </h4>
                        <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5 pt-1">
                          {customHighlights.map((hl, i) => (
                            <li key={i}>{hl}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Transparency and Action Box */}
                      <div className="bg-emerald-50 border border-dashed border-emerald-500 rounded-2xl p-4 text-center space-y-2">
                        <h5 className="text-xs font-bold text-emerald-900">
                          {isBn ? 'রশিদ ও অনুদানের সত্যতা যাচাই করুন' : 'Verify Your Donation Receipts Instantly'}
                        </h5>
                        <p className="text-[11px] text-emerald-700">
                          {isBn ? 'আমাদের অনলাইন পোর্টালে আপনার রশিদ আইডি বা কিউআর কোড স্ক্যান করে তাত্ক্ষণিক সত্যতা নিশ্চিত করুন।' : 'Scan your donation receipt QR code or verify receipt ID with 100% transparency.'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <a
                            href="/verify-donation"
                            target="_blank"
                            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase"
                          >
                            {isBn ? 'রশিদ সত্যতা যাচাই' : 'Verify Receipt Online'}
                          </a>
                          <a
                            href="/donation"
                            target="_blank"
                            className="px-4 py-2 bg-white text-emerald-800 border border-emerald-700 rounded-xl text-[11px] font-black uppercase"
                          >
                            {isBn ? 'নতুন অনুদান প্রদান' : 'Support Next Campaign'}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Email Footer */}
                    <div className="bg-slate-900 text-slate-400 p-6 text-center text-xs space-y-1">
                      <p className="font-bold text-white">{settings.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ'}</p>
                      <p>{settings.addressBn || 'ওয়ার্ড নং ১৭, ১নং রাস্তা, মিরবক্সটুলা, সিলেট, বাংলাদেশ'}</p>
                      <p>{isBn ? 'হেল্পলাইন:' : 'Helpline:'} {settings.phone || '+8801711975488'} | {settings.email || 'azadisocialwelfareorganization@gmail.com'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800">
                  <textarea
                    rows={16}
                    readOnly
                    value={generateEmailHtml()}
                    className="w-full bg-transparent font-mono text-xs text-emerald-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Dispatch Action Panel */}
              <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 text-white space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      {isBn ? 'চূড়ান্ত প্রেরণ পদক্ষেপ' : 'Final Dispatch Action'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {isBn ? `${selectedCount} জন নিবন্ধিত দাতাকে ইমেইল প্রেরণ` : `Dispatch to ${selectedCount} Registered Donors`}
                    </h3>
                    <p className="text-xs text-emerald-200">
                      {isBn 
                        ? 'সরাসরি স্বয়ংক্রিয় ব্যাচ ডেলিভারি রানার অথবা ইমেইল ক্লায়েন্টে (BCC) ওপেন করুন।' 
                        : 'Launch batch email dispatch runner or open directly in your mail client with BCC list.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Open in Email Client */}
                    <button
                      onClick={handleOpenEmailClient}
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer flex-1 sm:flex-none"
                      title={isBn ? 'আপনার ডিফল্ট ইমেইল অ্যাপ বা জিমেইলে খুলুন' : 'Open in your default email client (Gmail, Outlook, etc.)'}
                    >
                      <ExternalLink size={15} />
                      <span>{isBn ? 'ইমেইল অ্যাপে খুলুন (BCC)' : 'Open in Webmail (BCC)'}</span>
                    </button>

                    {/* Auto Batch Dispatch Button */}
                    <button
                      onClick={handleDispatchEmails}
                      disabled={isDispatching || selectedCount === 0}
                      className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex-1 sm:flex-none"
                    >
                      {isDispatching ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>{isBn ? `প্রেরণ চলছে (${dispatchProgress}%)...` : `Dispatching (${dispatchProgress}%)...`}</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>{isBn ? 'সারসংক্ষেপ ইমেইল প্রেরণ শুরু করুন' : 'Dispatch Monthly Impact Report'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dispatch Progress Bar & Status */}
                {isDispatching && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs text-emerald-300 font-bold">
                      <span>{isBn ? 'ইমেইল ডেলিভারি চলছে...' : 'Delivering emails to registered donors...'}</span>
                      <span className="font-mono">{dispatchProgress}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-300 rounded-full" 
                        style={{ width: `${dispatchProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Dispatch Success Alert */}
                {dispatchDone && (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 text-xs flex items-center gap-3 animate-in zoom-in-95">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">
                        {isBn ? 'ইমপ্যাক্ট রিপোর্ট সফলভাবে সম্পন্ন হয়েছে!' : 'Monthly Impact Report successfully dispatched!'}
                      </p>
                      <p className="text-[11px] text-emerald-200 mt-0.5">
                        {isBn 
                          ? `${selectedCount} জন নিবন্ধিত দাতার কাছে মাসিক সারসংক্ষেপ পাঠানো হয়েছে এবং সিস্টেম অডিট ট্রেইলে লিপিবদ্ধ করা হয়েছে।` 
                          : `Delivered to ${selectedCount} donors and securely recorded into Firebase Audit Logs.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Back */}
              <div className="flex justify-start pt-2">
                <button
                  onClick={() => setActiveTab('recipients')}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer"
                >
                  {isBn ? 'পূর্ববর্তী ধাপ' : 'Back'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
