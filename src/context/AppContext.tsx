import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  Donation, 
  Leadership, 
  Event, 
  OrganizationSettings, 
  LetterheadConfig, 
  DonationStatus, 
  Notice, 
  News,
  Expense,
} from '../types';
import { INITIAL_COMMITTEE } from '../utils/committee';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc,
  getDocs,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';

interface AppState {
  lang: Language;
  theme: 'light' | 'dark';
  isAdmin: boolean;
  user: FirebaseUser | null;
  authLoading: boolean;
  donations: Donation[];
  leadership: Leadership[];
  events: Event[];
  notices: Notice[];
  news: News[];
  expenses: Expense[];
  settings: OrganizationSettings;
  letterhead: LetterheadConfig;
  isLoaded: boolean;
  cloudSynced: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'error' | 'success';
  cloudErrorMessage?: string;
  cloudErrorType?: 'auth' | 'network' | 'other';
  loadingDonations: boolean;
  loadingLeadership: boolean;
  loadingEvents: boolean;
  loadingNotices: boolean;
  loadingNews: boolean;
  loadingExpenses: boolean;
  loadingSettings: boolean;
  loadingLetterhead: boolean;
  setLang: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (username?: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addDonation: (donation: Donation) => Promise<void>;
  updateDonation: (id: string, status: DonationStatus) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  saveSettings: (settings: OrganizationSettings) => Promise<void>;
  saveLetterhead: (config: LetterheadConfig) => Promise<void>;
  updateLeadership: (leadership: Leadership[]) => Promise<void>;
  replaceLeadership: (leadership: Leadership[]) => Promise<void>;
  saveLeader: (leader: Leadership) => Promise<void>;
  deleteLeader: (id: string) => Promise<void>;
  saveEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  saveNotice: (notice: Notice) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  saveNews: (news: News) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateNotices: (notices: Notice[]) => Promise<void>;
  updateNews: (news: News[]) => Promise<void>;
  updateEvents: (events: Event[]) => Promise<void>;
  retryCloudConnection: () => void;
  restoreFromLegacy: () => Promise<void>;
  resetAllData: () => Promise<void>;
  exportBackup: () => void;
  importBackup: (jsonText: string) => Promise<boolean>;
  seedDefaultDatabase: () => Promise<void>;
  googleAccessToken: string | null;
  setGoogleAccessToken: (token: string | null) => void;
}

const STATIC_SETTINGS: OrganizationSettings = {
  nameBn: "আজাদী সমাজ কল্যাণ সংঘ",
  nameEn: "Azadi Social Welfare Organization",
  sloganBn: "শিক্ষা · ঐক্য · সেবা · শান্তি · ক্রীড়া",
  sloganEn: "Education · Unity · Service · Peace · Sports",
  addressBn: "রোড নং ০১, মিরবক্সটুলা, সিলেট-৩১০০, বাংলাদেশ",
  addressEn: "Road No. 01, Mirbox Tula, Sylhet-3100, Bangladesh",
  phone: "+8801711975488",
  email: "azadisocialwelfareorganization@gmail.com",
  establishedBn: "১০ জুন ১৯৮৮ (২৭ শে জৈষ্ঠ ১৩৯৫)",
  establishedEn: "Established: 10 June 1988",
  logo: "https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh",
  flag: "https://lh3.googleusercontent.com/d/1TWJkEOGDsfJ4uH7NKqcDMLYHiTGEGM4q",
  adminWhatsApp: "8801711975488",
  bkash: "01711975488",
  nagad: "01711975488",
  roket: "01711975488",
  facebook: "https://www.facebook.com/profile.php?id=61585193438030",
  youtube: "https://youtube.com/@azadisocialwelfareorganization?si=gD7Akj6EdMYjHuFe",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb7KLIx0AgW4u9K4aw1k",
  googleChatSpace: "",
  googleChatEnabled: false,
  googleChatNotifyOnReceipt: true,
  googleChatNotifyOnApproval: true,
  googleChatNotifyOnExpense: true
};

const STATIC_DONATIONS: Donation[] = [
  {
    id: "don-1",
    donorName: "মোহাম্মদ ইউসুফ আলী (ইউএসএ)",
    isAnonymous: false,
    amount: 50000,
    phone: "01711XXXXXX",
    email: "yusuf@example.com",
    transactionId: "BK89XJ721S",
    purpose: "শিক্ষা কল্যাণ তহবিল",
    status: DonationStatus.APPROVED,
    date: new Date(2026, 4, 15).toISOString(),
    paymentMethod: "bKash"
  },
  {
    id: "don-2",
    donorName: "আলহাজ্ব উবায়দুল হক",
    isAnonymous: false,
    amount: 25000,
    phone: "01819XXXXXX",
    email: "ubaidul@example.com",
    transactionId: "NG90YK331M",
    purpose: "রমজান ইফতার সামগ্রী বিতরণ",
    status: DonationStatus.APPROVED,
    date: new Date(2026, 4, 18).toISOString(),
    paymentMethod: "Nagad"
  },
  {
    id: "don-3",
    donorName: "নাম প্রকাশে অনিচ্ছুক",
    isAnonymous: true,
    amount: 10000,
    phone: "",
    email: "",
    transactionId: "RK11ZP552D",
    purpose: "ক্রীড়া সামগ্রী উন্নয়ন তহবিল",
    status: DonationStatus.APPROVED,
    date: new Date(2026, 4, 25).toISOString(),
    paymentMethod: "Rocket"
  }
];

const STATIC_LEADERSHIP: Leadership[] = INITIAL_COMMITTEE.map((m, i) => ({
  id: `leader-${i + 1}`,
  nameEn: m.nameEn,
  nameBn: m.nameBn,
  designationEn: m.designationEn,
  designationBn: m.designationBn,
  subDesignationEn: m.subDesignationEn || "",
  subDesignationBn: m.subDesignationBn || "",
  messageEn: i === 0 ? "Welcome to Azadi Social Welfare Organization. We are committed to serving the community." : "",
  messageBn: i === 0 ? "আজাদী সমাজ কল্যাণ সংঘে আপনাকে স্বাগতম। আমরা মানবতার কল্যাণে কাজ করতে প্রতিশ্রুতিবদ্ধ।" : "",
  phone: "01711975488",
  image: m.order === 1 
    ? "https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh" 
    : "",
  order: m.order,
  category: m.order <= 6 ? 'leader' : 'executive',
  status: 'active',
  createdAt: new Date(1988, 5, 10).toISOString()
}));

const STATIC_EVENTS: Event[] = [
  {
    id: "eve-1",
    titleEn: "Annual Sports Tournament 2026",
    titleBn: "বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬",
    descriptionEn: "Join us for our annual athletic meet with different events for all age groups.",
    descriptionBn: "সব বয়সী মানুষের জন্য বিভিন্ন ধরণের খেলাধুলা নিয়ে আমাদের বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬ এ যোগ দিন।",
    locationEn: "Mirbox Tula Field, Sylhet",
    locationBn: "মিরবক্সটুলা মাঠ, সিলেট",
    date: new Date(2026, 6, 20).toISOString(),
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
    meetUrl: "https://meet.google.com/abc-defg-hij"
  },
  {
    id: "eve-2",
    titleEn: "Free Medical Camp & Blood Donation",
    titleBn: "বিনামূল্যে চিকিৎসা ক্যাম্প ও রক্তদান কর্মসূচী",
    descriptionEn: "Providing free healthcare consultation and medicine distribution along with blood grouping.",
    descriptionBn: "বিনামূল্যে স্বাস্থ্য পরামর্শ, ওষুধ বিতরণ এবং রক্তের গ্রুপ নির্ণয় কর্মসূচী।",
    locationEn: "Azadi Club Building, Sylhet",
    locationBn: "আজাদী ক্লাব ভবন, সিলেট",
    date: new Date(2026, 5, 29).toISOString(),
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500",
    meetUrl: "https://meet.google.com/xyz-mno-pqr"
  }
];

const STATIC_NOTICES: Notice[] = [
  {
    id: "not-1",
    titleEn: "Emergency Executive Committee Meeting",
    titleBn: "জরুরী কার্যনির্বাহী কমিটির সভা",
    contentEn: "An emergency meeting of the executive committee will be held on Friday at 7:00 PM.",
    contentBn: "আগামী শুক্রবার সন্ধ্যা ৭:০০ ঘটিকায় কার্যনির্বাহী কমিটির এক জরুরী সভা অনুষ্ঠিত হইবে।",
    date: new Date(2026, 5, 26).toISOString(),
    isUrgent: true
  },
  {
    id: "not-2",
    titleEn: "Membership Renewal Circular 2026",
    titleBn: "সদস্যপদ নবায়ন বিজ্ঞপ্তি ২০২৬",
    contentEn: "All members are requested to renew their yearly subscription package by June 30.",
    contentBn: "সকল সম্মানিত সদস্যদের আগামী ৩০শে জুনের মধ্যে তাদের বার্ষিক চাঁদা পরিশোধ করে সদস্যপদ নবায়নের অনুরোধ করা যাচ্ছে।",
    date: new Date(2026, 5, 10).toISOString(),
    isUrgent: false
  }
];

const STATIC_NEWS: News[] = [
  {
    id: "news-1",
    titleEn: "Relief Distribution Among Flood Affected Families",
    titleBn: "বন্যা কবলিত অসহায় পরিবারগুলোর মাঝে ত্রাণ বিতরণ",
    contentEn: "Azadi Social Welfare Organization has distributed food packets and essential supplies to 500 families.",
    contentBn: "আজাদী সমাজ কল্যাণ সংঘ সিলেট অঞ্চলের বানভাসী ৫০০টি পরিবারের মাঝে শুকনো খাবার ও প্রয়োজনীয় ত্রাণ সামগ্রী বিতরণ করেছে।",
    date: new Date(2026, 4, 10).toISOString(),
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500"
  },
  {
    id: "news-2",
    titleEn: "Celebration of 38th Founding Anniversary of Azadi Club",
    titleBn: "আজাদী ক্লাবের ৩৮তম প্রতিষ্ঠাবার্ষিকী উদযাপন",
    contentEn: "On 10th June, the club celebrated its 38th years since establishing with deep pride and joy.",
    contentBn: "গত ১০ই জুন এক বর্ণাঢ্য অনুষ্ঠানের মধ্য দিয়ে ক্লাবের ৩৮তম প্রতিষ্ঠাবার্ষিকী উদযাপিত হয়েছে।",
    date: new Date(2026, 5, 10).toISOString(),
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500"
  }
];

const STATIC_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    amount: 15000,
    category: "Sports",
    descriptionEn: "Purchased footballs, cricket bats, and jerseys for the local youth athletic development tournament.",
    descriptionBn: "স্থানীয় যুব ক্রীড়া টুর্নামেন্টের জন্য ফুটবল, ক্রিকেট ব্যাট এবং জার্সি ক্রয়।",
    date: new Date(2026, 4, 10).toISOString().split('T')[0]
  },
  {
    id: "exp-2",
    amount: 20000,
    category: "Education",
    descriptionEn: "Provided scholarship textbooks, materials, and stipends to underprivileged meritorious students.",
    descriptionBn: "দরিদ্র ও মেধাবী শিক্ষার্থীদের মাঝে বিনামূল্যে পাঠ্যপুস্তক, শিক্ষা সামগ্রী এবং নগদ বৃত্তি প্রদান।",
    date: new Date(2026, 4, 14).toISOString().split('T')[0]
  },
  {
    id: "exp-3",
    amount: 8000,
    category: "General Welfare",
    descriptionEn: "Arranged community medical counseling, healthy hygiene pamphlets, and emergency medicine distributions.",
    descriptionBn: "বিনামূল্যে চিকিৎসা পরামর্শ সেবা ও পথ্য বিতরণের আনুষঙ্গিক খরচাদি প্রদান।",
    date: new Date(2026, 4, 19).toISOString().split('T')[0]
  }
];

const STATIC_LETTERHEAD: LetterheadConfig = {
  leaderName: "মোঃ আব্দুছ ছাবির (টুটুল)",
  designation: "সভাপতি",
  signature: "",
  stampText: "আজাদী সমাজ কল্যাণ সংঘ, সিলেট",
  bodyText: ""
};

const getCachedData = <T,>(key: string, defaultValue: T): T => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('azadi_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  // Firestore states (fallback initialized to cached/mock content for instant page load)
  const [donations, setDonations] = useState<Donation[]>(() => getCachedData('azadi_donations', STATIC_DONATIONS));
  const [leadership, setLeadership] = useState<Leadership[]>(() => getCachedData('azadi_leadership', STATIC_LEADERSHIP));
  const [events, setEvents] = useState<Event[]>(() => getCachedData('azadi_events', STATIC_EVENTS));
  const [notices, setNotices] = useState<Notice[]>(() => getCachedData('azadi_notices', STATIC_NOTICES));
  const [news, setNews] = useState<News[]>(() => getCachedData('azadi_news', STATIC_NEWS));
  const [expenses, setExpenses] = useState<Expense[]>(() => getCachedData('azadi_expenses', STATIC_EXPENSES));
  const [settings, setSettings] = useState<OrganizationSettings>(() => getCachedData('azadi_settings', STATIC_SETTINGS));
  const [letterhead, setLetterhead] = useState<LetterheadConfig>(() => getCachedData('azadi_letterhead', STATIC_LETTERHEAD));
  const [isLoaded, setIsLoaded] = useState(true);

  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingLeadership, setLoadingLeadership] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingLetterhead, setLoadingLetterhead] = useState(true);

  const [cloudSynced, setCloudSynced] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('success');

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('azadi_theme', newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Test connection on boot according to SKILL.md (delayed to prevent blocking initial load)
  useEffect(() => {
    const timer = setTimeout(() => {
      async function testConnection() {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          if (errMsg.toLowerCase().includes('offline')) {
            console.warn("Firebase is offline. Relying on local cache/capabilities.");
          } else {
            console.warn("Firebase connection test notice:", errMsg);
          }
        }
      }
      testConnection();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for Authentication state
  useEffect(() => {
    const checkAdminPersistence = () => {
      return sessionStorage.getItem('azadi_admin_session') === 'true' ||
             localStorage.getItem('azadi_admin_session') === 'true' ||
             localStorage.getItem('azadi_custom_admin') === 'true';
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Evaluate if user is admin
        const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL || 'pavel4mutiara@gmail.com').toLowerCase();
        const isSuperAdminEmail = currentUser.email ? currentUser.email.toLowerCase() === superAdminEmail : false;
        
        try {
          const adminRef = doc(db, 'admins', currentUser.uid);
          const adminDoc = await getDoc(adminRef);
          if (adminDoc.exists()) {
            setIsAdmin(true);
          } else if (isSuperAdminEmail) {
            // Self-seed admin document
            await setDoc(adminRef, {
              email: currentUser.email,
              role: 'superadmin',
              createdAt: new Date().toISOString()
            });
            setIsAdmin(true);
          } else {
            if (checkAdminPersistence()) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          }
        } catch (e) {
          if (isSuperAdminEmail || checkAdminPersistence()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } else {
        if (checkAdminPersistence()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time Listeners for Firestore Collections
  useEffect(() => {
    // 1. Settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as OrganizationSettings;
        setSettings(data);
        localStorage.setItem('azadi_settings', JSON.stringify(data));
      }
      setLoadingSettings(false);
    }, () => {
      setLoadingSettings(false);
    });

    // 2. Letterhead listener
    const unsubLetterhead = onSnapshot(doc(db, 'settings', 'letterhead'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as LetterheadConfig;
        setLetterhead(data);
        localStorage.setItem('azadi_letterhead', JSON.stringify(data));
      }
      setLoadingLetterhead(false);
    }, () => {
      setLoadingLetterhead(false);
    });

    // 3. Donations listener
    const unsubDonations = onSnapshot(query(collection(db, 'donations'), orderBy('date', 'desc')), (snap) => {
      console.log("[DEBUG] Donations collection listener received snapshot. Size:", snap.size, "Is empty:", snap.empty);
      if (!snap.empty) {
        const list: Donation[] = [];
        snap.forEach(d => {
          const item = d.data();
          list.push(item as Donation);
        });
        setDonations(list);
        localStorage.setItem('azadi_donations', JSON.stringify(list));
      } else {
        console.log("[DEBUG] Donations snapshot is empty. Applying empty array.");
        setDonations([]);
        localStorage.setItem('azadi_donations', JSON.stringify([]));
      }
      setLoadingDonations(false);
    }, (error) => {
      console.error("[DEBUG] ERROR on snapshot donations fetch:", error);
      handleFirestoreError(error, OperationType.LIST, 'donations');
      setLoadingDonations(false);
    });

    // 4. Leadership listener
    const unsubLeadership = onSnapshot(query(collection(db, 'leadership'), orderBy('order', 'asc')), (snap) => {
      if (!snap.empty) {
        const list: Leadership[] = [];
        snap.forEach(d => list.push(d.data() as Leadership));
        setLeadership(list);
        localStorage.setItem('azadi_leadership', JSON.stringify(list));
      } else {
        setLeadership(STATIC_LEADERSHIP);
        localStorage.setItem('azadi_leadership', JSON.stringify(STATIC_LEADERSHIP));
      }
      setLoadingLeadership(false);
    }, (error) => {
      console.warn("Leadership listener failed or offline, falling back to STATIC_LEADERSHIP:", error);
      setLeadership(STATIC_LEADERSHIP);
      setLoadingLeadership(false);
    });

    // 5. Events listener
    const unsubEvents = onSnapshot(query(collection(db, 'events'), orderBy('date', 'desc')), (snap) => {
      if (!snap.empty) {
        const list: Event[] = [];
        snap.forEach(d => list.push(d.data() as Event));
        setEvents(list);
        localStorage.setItem('azadi_events', JSON.stringify(list));
      } else {
        setEvents([]);
        localStorage.setItem('azadi_events', JSON.stringify([]));
      }
      setLoadingEvents(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
      setLoadingEvents(false);
    });

    // 6. Notices listener
    const unsubNotices = onSnapshot(query(collection(db, 'notices'), orderBy('date', 'desc')), (snap) => {
      if (!snap.empty) {
        const list: Notice[] = [];
        snap.forEach(d => list.push(d.data() as Notice));
        setNotices(list);
        localStorage.setItem('azadi_notices', JSON.stringify(list));
      } else {
        setNotices([]);
        localStorage.setItem('azadi_notices', JSON.stringify([]));
      }
      setLoadingNotices(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notices');
      setLoadingNotices(false);
    });

    // 7. News listener
    const unsubNews = onSnapshot(query(collection(db, 'news'), orderBy('date', 'desc')), (snap) => {
      if (!snap.empty) {
        const list: News[] = [];
        snap.forEach(d => list.push(d.data() as News));
        setNews(list);
        localStorage.setItem('azadi_news', JSON.stringify(list));
      } else {
        setNews([]);
        localStorage.setItem('azadi_news', JSON.stringify([]));
      }
      setLoadingNews(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news');
      setLoadingNews(false);
    });

    // 8. Expenses listener
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('date', 'desc')), (snap) => {
      if (!snap.empty) {
        const list: Expense[] = [];
        snap.forEach(d => list.push(d.data() as Expense));
        setExpenses(list);
        localStorage.setItem('azadi_expenses', JSON.stringify(list));
      } else {
        setExpenses([]);
        localStorage.setItem('azadi_expenses', JSON.stringify([]));
      }
      setLoadingExpenses(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'expenses');
      setLoadingExpenses(false);
    });

    return () => {
      unsubSettings();
      unsubLetterhead();
      unsubDonations();
      unsubLeadership();
      unsubEvents();
      unsubNotices();
      unsubNews();
      unsubExpenses();
    };
  }, []);

  // Database auto-seeder step
  const seedDefaultDatabase = async () => {
    try {
      setCloudSyncStatus('syncing');
      await setDoc(doc(db, 'settings', 'config'), STATIC_SETTINGS);
      await setDoc(doc(db, 'settings', 'letterhead'), STATIC_LETTERHEAD);

      for (const d of STATIC_DONATIONS) {
        await setDoc(doc(db, 'donations', d.id), d);
      }
      for (const l of STATIC_LEADERSHIP) {
        await setDoc(doc(db, 'leadership', l.id), l);
      }
      for (const e of STATIC_EVENTS) {
        await setDoc(doc(db, 'events', e.id), e);
      }
      for (const n of STATIC_NOTICES) {
        await setDoc(doc(db, 'notices', n.id), n);
      }
      for (const ns of STATIC_NEWS) {
        await setDoc(doc(db, 'news', ns.id), ns);
      }
      for (const ex of STATIC_EXPENSES) {
        await setDoc(doc(db, 'expenses', ex.id), ex);
      }
      setCloudSyncStatus('success');
    } catch (error) {
      console.error("Auto seeding failed:", error);
      setCloudSyncStatus('error');
    }
  };

  // Auto-seed triggers once admin is logged in but firestore settings index is missing
  useEffect(() => {
    if (isAdmin && settings.nameBn === STATIC_SETTINGS.nameBn) {
      // Check if document exists on server
      getDoc(doc(db, 'settings', 'config'))
        .then((snap) => {
          if (!snap.exists()) {
            console.log("Seeding newly-discovered database with default structures...");
            seedDefaultDatabase();
          }
        })
        .catch((error) => {
          console.warn("Failed to retrieve database configuration (possibly offline):", error);
        });
    }
  }, [isAdmin, settings]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/chat');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        console.log("[DEBUG] Captured Google Chat scoped OAuth token.");
        setGoogleAccessToken(credential.accessToken);
      }
    } catch (error) {
      console.error("Authentication popup failed:", error);
    }
  };

  const login = async (username?: string, password?: string): Promise<boolean> => {
    if (!username || !password) return false;
    
    // Check local credential fallback to allow immediate login with provided credentials
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    if ((cleanUser === 'azadi' || cleanUser === 'azadi@azadi.org') && cleanPass === 'Azadi@88') {
      console.log("Local Admin Fallback credential authorized.");
      sessionStorage.setItem('azadi_admin_session', 'true');
      localStorage.setItem('azadi_admin_session', 'true');
      localStorage.setItem('azadi_custom_admin', 'true');
      setIsAdmin(true);
      return true;
    }
    
    // Support either direct email, or user typing 'admin' / other username (append @azadi.org if no @ symbol)
    const email = username.includes('@') ? username.trim() : `${username.toLowerCase().trim()}@azadi.org`;

    try {
      // 1. Attempt Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      
      // Determine if they are authorized admins (either database check or superadmin email)
      const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL || 'pavel4mutiara@gmail.com').toLowerCase();
      const isSuperAdminEmail = currentUser.email ? currentUser.email.toLowerCase() === superAdminEmail : false;
      
      let isAuthorizedAdmin = false;
      try {
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        if (adminDoc.exists() || isSuperAdminEmail) {
          isAuthorizedAdmin = true;
          if (isSuperAdminEmail && !adminDoc.exists()) {
            // Seed super admin dynamically if not seeded yet
            await setDoc(doc(db, 'admins', currentUser.uid), {
              email: currentUser.email,
              role: 'superadmin',
              createdAt: new Date().toISOString()
            });
          }
        }
      } catch (dbError) {
        console.warn("Could not check Firestore admin collection (possibly offline). Fallback to superadmin check.", dbError);
        // Fallback for sandboxes or initial offline boots
        if (isSuperAdminEmail) {
          isAuthorizedAdmin = true;
        }
      }

      if (isAuthorizedAdmin) {
        sessionStorage.setItem('azadi_admin_session', 'true');
        localStorage.setItem('azadi_admin_session', 'true');
        setIsAdmin(true);
        return true;
      } else {
        // Not authorized as an admin in Firestore admins collection
        await signOut(auth);
        return false;
      }
    } catch (error: any) {
      console.error("Firebase auth login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem('azadi_admin_session');
      localStorage.removeItem('azadi_admin_session');
      localStorage.removeItem('azadi_custom_admin');
      setIsAdmin(false);
      await signOut(auth);
      setGoogleAccessToken(null);
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  // Secure compliance audit logging trail
  const logAuditTrail = async (action: string, details: any) => {
    try {
      const logId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        action,
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'anonymous',
        timestamp: new Date().toISOString(),
        details: typeof details === 'object' ? JSON.stringify(details) : String(details)
      });
    } catch (e) {
      console.warn("Audit logging failed:", e);
    }
  };

  // Send Google Chat Notification helper
  const triggerGoogleChatNotification = async (text: string, cardsV2?: any[]) => {
    if (!settings.googleChatEnabled || !settings.googleChatSpace) {
      return;
    }
    const isWebhook = settings.googleChatSpace.startsWith('http://') || settings.googleChatSpace.startsWith('https://');
    if (!isWebhook && !googleAccessToken) {
      return;
    }
    try {
      const { sendGoogleChatMessage } = await import('../utils/googleChat');
      await sendGoogleChatMessage(googleAccessToken, settings.googleChatSpace, text, cardsV2);
      console.log("[DEBUG] Google Chat notification sent successfully.");
    } catch (error) {
      console.warn("[DEBUG] Google Chat auto-notification failed:", error);
    }
  };

  // WRITE OPERATIONS TO FIRESTORE WITH FORTRESS EXCEPTION HANDLING
  const addDonation = async (donation: Donation) => {
    // Optimistic UI update
    setDonations(prev => {
      if (prev.some(d => d.id === donation.id)) {
        return prev.map(d => d.id === donation.id ? donation : d);
      }
      return [donation, ...prev];
    });

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'donations', donation.id), donation);
      }

      // Google Chat auto-trigger on new donation request submission
      if (settings.googleChatEnabled && settings.googleChatNotifyOnReceipt !== false) {
        console.log(`[DEBUG] Attempting to trigger Google Chat notification for donation: ${donation.id}, Donor: ${donation.donorName}, Amount: ৳${donation.amount}`);
        const donorLabel = donation.isAnonymous ? (lang === 'bn' ? 'বেনামী' : 'Anonymous') : donation.donorName;
        const text = `📢 *${lang === 'bn' ? 'নতুন অনুদান জমা হয়েছে!' : 'New Donation Submitted!'}*\n` +
                     `• ${lang === 'bn' ? 'দাতা' : 'Donor'}: ${donorLabel}\n` +
                     `• ${lang === 'bn' ? 'পরিমাণ' : 'Amount'}: ৳${donation.amount.toLocaleString()} BDT\n` +
                     `• ${lang === 'bn' ? 'মাধ্যম' : 'Method'}: ${donation.paymentMethod || 'N/A'}\n` +
                     `• ${lang === 'bn' ? 'খাত' : 'Purpose'}: ${donation.purpose}\n` +
                     `• ${lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}: ${donation.status}`;
        triggerGoogleChatNotification(text);
      }
    } catch (error) {
      console.warn("Firestore error adding donation (might be offline or fallback):", error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.WRITE, `donations/${donation.id}`);
      }
    }
  };

  const updateDonation = async (id: string, status: DonationStatus) => {
    console.log("[DEBUG] updateDonation initiated. ID:", id, "Status update requested:", status);
    const existing = donations.find(d => d.id === id);
    console.log("[DEBUG] Found existing donation status in local AppState:", existing);
    if (!existing) {
      console.warn("[DEBUG] CRITICAL WARNING: Donation ID not found in the state array. Fallback spread will occur.");
    }

    // Optimistic update
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));

    try {
      if (auth.currentUser) {
        const docRef = doc(db, 'donations', id);
        const updateData = { ...existing!, status };
        console.log("[DEBUG] Writing to Firestore at path donations/" + id, "Payload:", updateData);
        await setDoc(docRef, updateData);
        console.log("[DEBUG] Firestore write success for donations/" + id);
        await logAuditTrail('DONATION_STATUS_UPDATE', { donationId: id, status });
      }

      // Google Chat auto-trigger when an admin approves a donation
      if (settings.googleChatNotifyOnApproval && status === DonationStatus.APPROVED) {
        const donorLabel = existing?.isAnonymous ? (lang === 'bn' ? 'বেনামী' : 'Anonymous') : (existing?.donorName || 'N/A');
        const text = `✅ *${lang === 'bn' ? 'অনুদান অনুমোদিত হয়েছে!' : 'Donation Approved & Recorded!'}*\n` +
                     `• ${lang === 'bn' ? 'দাতা' : 'Donor'}: ${donorLabel}\n` +
                     `• ${lang === 'bn' ? 'পরিমাণ' : 'Amount'}: ৳${existing?.amount.toLocaleString()} BDT\n` +
                     `• ${lang === 'bn' ? 'মাধ্যম' : 'Method'}: ${existing?.paymentMethod || 'N/A'}\n` +
                     `• ${lang === 'bn' ? 'খাত' : 'Purpose'}: ${existing?.purpose || 'N/A'}\n` +
                     `• ${lang === 'bn' ? 'ট্রানজেকশন আইডি' : 'TxID'}: \`${existing?.transactionId || 'N/A'}\``;

        try {
          const { createChatCard } = await import('../utils/googleChat');
          const cardsV2 = createChatCard(
            lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংঘ' : 'Azadi Social Welfare Society',
            lang === 'bn' ? 'অনুদান অনুমোদন বিজ্ঞপ্তি' : 'Donation Approval Notification',
            [
              {
                header: lang === 'bn' ? 'অনুমোদনের বিবরণ' : 'Approval Details',
                widgets: [
                  {
                    decoratedText: {
                      topLabel: lang === 'bn' ? 'দাতার নাম' : 'Donor',
                      text: donorLabel,
                      startIcon: { knownIcon: 'PERSON' }
                    }
                  },
                  {
                    decoratedText: {
                      topLabel: lang === 'bn' ? 'পরিমাণ' : 'Amount',
                      text: `৳${existing?.amount?.toLocaleString() || '0'} BDT`,
                      startIcon: { knownIcon: 'TICKET' }
                    }
                  },
                  {
                    decoratedText: {
                      topLabel: lang === 'bn' ? 'উদ্দেশ্য / খাত' : 'Purpose',
                      text: existing?.purpose || 'General',
                      startIcon: { knownIcon: 'DESCRIPTION' }
                    }
                  },
                  {
                    decoratedText: {
                      topLabel: lang === 'bn' ? 'পদ্ধতি ও ট্রানজেকশন আইডি' : 'Method & TxID',
                      text: `${existing?.paymentMethod || 'N/A'} - ${existing?.transactionId || 'N/A'}`,
                      startIcon: { knownIcon: 'STAR' }
                    }
                  }
                ]
              }
            ]
          );
          triggerGoogleChatNotification(text, cardsV2);
        } catch {
          triggerGoogleChatNotification(text);
        }
      }
    } catch (error) {
      console.error("[DEBUG] ERROR updating donation status in Firestore:", error);
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.UPDATE, `donations/${id}`);
      }
    }
  };

  const deleteDonation = async (id: string) => {
    const backupDonations = [...donations];
    try {
      const target = donations.find(d => d.id === id);
      // Immediately remove from state to guarantee crisp, instant deletion in the UI
      setDonations(prev => prev.filter(d => d.id !== id));

      if (auth.currentUser) {
        await deleteDoc(doc(db, 'donations', id));
        await logAuditTrail('DONATION_DELETION', { donationId: id, donorName: target?.donorName, amount: target?.amount });
      }
      
      // Let the user know deletion was successful
      alert(lang === 'bn' ? 'অনুদান এন্ট্রিটি সফলভাবে মুছে ফেলা হয়েছে!' : 'Donation entry has been successfully deleted!');
    } catch (error) {
      console.warn("Firestore delete failed, reverting state:", error);
      // Rollback immediately to original donations list
      setDonations(backupDonations);
      
      alert(lang === 'bn' 
        ? 'অনুদানটি মুছে ফেলা সম্ভব হয়নি! দয়া করে ইন্টারনেট কানেকশন চেক করুন অথবা পুনরায় লগইন করুন।' 
        : 'Could not delete the donation! Please check your internet connection and try again.'
      );
    }
  };

  const saveSettings = async (newSettings: OrganizationSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'config'), newSettings);
      await logAuditTrail('SETTINGS_CONFIGURATION_UPDATE', { nameEn: newSettings.nameEn });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/config');
    }
  };

  const saveLetterhead = async (newLetterhead: LetterheadConfig) => {
    try {
      await setDoc(doc(db, 'settings', 'letterhead'), newLetterhead);
      await logAuditTrail('LETTERHEAD_CONFIGURATION_UPDATE', { leaderName: newLetterhead.leaderName });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/letterhead');
    }
  };

  const updateLeadership = async (leadershipList: Leadership[]) => {
    for (const leader of leadershipList) {
      await saveLeader(leader);
    }
  };

  const replaceLeadership = async (leadershipList: Leadership[]) => {
    const listToSave = leadershipList.length === 0 ? STATIC_LEADERSHIP : leadershipList;
    try {
      // Optimistic local state update
      setLeadership(listToSave);
      
      const batch = writeBatch(db);
      const snap = await getDocs(collection(db, 'leadership'));
      
      // Delete existing documents
      for (const d of snap.docs) {
        batch.delete(d.ref);
      }
      
      // Add or rewrite new default documents
      for (const l of listToSave) {
        batch.set(doc(db, 'leadership', l.id), l);
      }
      
      // Atomically commit batch to Firestore
      await batch.commit();
    } catch (error) {
      console.warn("Failed to replace leadership on server. Keeping local fallback state:", error);
      setLeadership(listToSave);
    }
  };

  const saveLeader = async (leader: Leadership) => {
    try {
      await setDoc(doc(db, 'leadership', leader.id), leader);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leadership/${leader.id}`);
    }
  };

  const deleteLeader = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'leadership', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leadership/${id}`);
    }
  };

  const saveEvent = async (event: Event) => {
    try {
      await setDoc(doc(db, 'events', event.id), event);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `events/${event.id}`);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  };

  const saveNotice = async (notice: Notice) => {
    try {
      await setDoc(doc(db, 'notices', notice.id), notice);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notices/${notice.id}`);
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    }
  };

  const saveNews = async (item: News) => {
    try {
      await setDoc(doc(db, 'news', item.id), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `news/${item.id}`);
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `news/${id}`);
    }
  };

  const addExpense = async (item: Expense) => {
    try {
      await setDoc(doc(db, 'expenses', item.id), item);
      
      // Google Chat trigger on new expense entry
      if (settings.googleChatNotifyOnExpense) {
        const text = `💸 *${lang === 'bn' ? 'নতুন খরচ (ব্যয়) রেকর্ড করা হয়েছে!' : 'New Expense Recorded!'}*\n` +
                     `• ${lang === 'bn' ? 'বিবরণ' : 'Description'}: ${lang === 'bn' ? item.descriptionBn : item.descriptionEn}\n` +
                     `• ${lang === 'bn' ? 'পরিমাণ' : 'Amount'}: ৳${item.amount.toLocaleString()} BDT\n` +
                     `• ${lang === 'bn' ? 'তারিখ' : 'Date'}: ${item.date}\n` +
                     `• ${lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}: ${item.category}`;

        try {
          const { createChatCard } = await import('../utils/googleChat');
          const cardsV2 = createChatCard(
            lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংঘ' : 'Azadi Social Welfare Society',
            lang === 'bn' ? 'খরচের এন্ট্রি রেকর্ড' : 'Expense Record Notification',
            [
              {
                header: lang === 'bn' ? 'খরচের বিবরণ' : 'Expense Details',
                widgets: [
                  {
                    decoratedText: {
                      topLabel: lang === 'bn' ? 'বিবরণ' : 'Description',
                      text: lang === 'bn' ? item.descriptionBn : item.descriptionEn,
                      startIcon: { knownIcon: 'DESCRIPTION' }
                    }
                  },
                  {
                    decoratedText: {
                      topLabel: lang === 'bn' ? 'পরিমাণ' : 'Amount',
                      text: `৳${item.amount?.toLocaleString() || '0'} BDT`,
                      startIcon: { knownIcon: 'TICKET' }
                    }
                  },
                  {
                    decoratedText: {
                      topLabel: lang === 'bn' ? 'তারিখ ও ক্যাটাগরি' : 'Date & Category',
                      text: `${item.date} (${item.category})`,
                      startIcon: { knownIcon: 'CLOCK' }
                    }
                  }
                ]
              }
            ]
          );
          triggerGoogleChatNotification(text, cardsV2);
        } catch {
          triggerGoogleChatNotification(text);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `expenses/${item.id}`);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
    }
  };

  const updateNotices = async (noticesList: Notice[]) => {
    for (const n of noticesList) {
      await saveNotice(n);
    }
  };

  const updateNews = async (newList: News[]) => {
    for (const nw of newList) {
      await saveNews(nw);
    }
  };

  const updateEvents = async (eventsList: Event[]) => {
    for (const ev of eventsList) {
      await saveEvent(ev);
    }
  };

  const retryCloudConnection = () => {
    setCloudSynced(true);
    setCloudSyncStatus('success');
  };

  const restoreFromLegacy = async () => {
    await seedDefaultDatabase();
    await logAuditTrail('DATABASE_RESEED_TEMPLATES', { timestamp: new Date().toISOString() });
  };

  const resetAllData = async () => {
    try {
      setCloudSyncStatus('syncing');
      const collections = ['donations', 'leadership', 'events', 'notices', 'news', 'expenses'];
      for (const col of collections) {
        const snap = await getDocs(collection(db, col));
        for (const doc of snap.docs) {
          await deleteDoc(doc.ref);
        }
      }
      await seedDefaultDatabase();
      await logAuditTrail('DATABASE_FORCE_WIPE_AND_RESET', { timestamp: new Date().toISOString() });
      alert(lang === 'bn' ? 'ডাটাবেস সফলভাবে রি-সেট করা হয়েছে!' : 'Database successfully reset to defaults!');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'all');
    }
  };

  const exportBackup = () => {
    const data = {
      settings,
      letterhead,
      donations,
      leadership,
      events,
      notices,
      news,
      expenses
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `azadi_backup_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importBackup = async (jsonText: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonText);
      if (data.settings) await saveSettings(data.settings);
      if (data.letterhead) await saveLetterhead(data.letterhead);
      if (data.donations) {
        for (const d of data.donations) await addDonation(d);
      }
      if (data.leadership) {
        for (const l of data.leadership) await saveLeader(l);
      }
      if (data.events) {
        for (const ev of data.events) await saveEvent(ev);
      }
      if (data.notices) {
        for (const n of data.notices) await saveNotice(n);
      }
      if (data.news) {
        for (const nw of data.news) await saveNews(nw);
      }
      if (data.expenses) {
        for (const ex of data.expenses) await addExpense(ex);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      lang, 
      theme, 
      isAdmin, 
      user, 
      authLoading, 
      donations, 
      leadership, 
      events, 
      notices, 
      news, 
      expenses,
      settings, 
      letterhead, 
      isLoaded, 
      cloudSynced, 
      cloudSyncStatus,
      loadingDonations,
      loadingLeadership,
      loadingEvents,
      loadingNotices,
      loadingNews,
      loadingExpenses,
      loadingSettings,
      loadingLetterhead,
      
      setLang, 
      setTheme, 
      login,
      loginWithGoogle,
      logout,
      
      addDonation,
      updateDonation,
      deleteDonation,
 
      saveSettings,
      saveLetterhead,
 
      updateLeadership,
      replaceLeadership,
      updateEvents,
      updateNotices,
      updateNews,
 
      saveLeader,
      deleteLeader,
      
      saveEvent,
      deleteEvent,
 
      saveNotice,
      deleteNotice,
 
      saveNews,
      deleteNews,

      addExpense,
      deleteExpense,

      retryCloudConnection,
      restoreFromLegacy,
      resetAllData,
      exportBackup,
      importBackup,
      seedDefaultDatabase,
      googleAccessToken,
      setGoogleAccessToken
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp error");
  return context;
};
