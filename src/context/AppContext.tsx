
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Language, 
  Donation, 
  Leadership, 
  Event, 
  FinancialRecord, 
  OrganizationSettings, 
  LetterheadConfig, 
  DonationStatus, 
  Notice, 
  News,
} from '../types';
import { 
  db,
  auth,
  saveItem, 
  deleteItem, 
  subscribeCollection, 
  saveSettingsCloud, 
  saveLetterheadCloud, 
  subscribeSettings, 
  subscribeLetterhead,
  getLegacyData,
  reEnableCloudNetwork,
  repairImageUrl
} from '../firebase';
import { INITIAL_COMMITTEE } from '../utils/committee';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

console.log("AppContext module loading...");

interface AppState {
  lang: Language;
  theme: 'light' | 'dark';
  isAdmin: boolean;
  user: User | null;
  authLoading: boolean;
  donations: Donation[];
  leadership: Leadership[];
  events: Event[];
  notices: Notice[];
  news: News[];
  settings: OrganizationSettings;
  letterhead: LetterheadConfig;
  isLoaded: boolean;
  cloudSynced: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'error' | 'success';
  cloudErrorMessage?: string;
  cloudErrorType?: 'auth' | 'network' | 'other';
  setLang: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (username?: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addDonation: (donation: Omit<Donation, 'id' | 'status' | 'date'>) => void;
  updateDonation: (id: string, status: DonationStatus) => void;
  deleteDonation: (id: string) => void;
  saveSettings: (settings: OrganizationSettings) => void;
  saveLetterhead: (config: LetterheadConfig) => void;
  addFinancialRecord: (record: Omit<FinancialRecord, 'id' | 'date'>) => void;
  updateLeadership: (leadership: Leadership[]) => void;
  replaceLeadership: (leadership: Leadership[]) => Promise<void>;
  saveLeader: (leader: Leadership) => void;
  deleteLeader: (id: string) => void;
  saveEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  saveNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;
  saveNews: (news: News) => void;
  deleteNews: (id: string) => void;
  updateNotices: (notices: Notice[]) => void;
  updateNews: (news: News[]) => void;
  updateEvents: (events: Event[]) => void;
  retryCloudConnection: () => void;
  restoreFromLegacy: () => Promise<void>;
}

const DEFAULT_SETTINGS: OrganizationSettings = {
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
  whatsappChannel: "https://whatsapp.com/channel/0029Vb7KLIx0AgW4u9K4aw1k"
};

const AppContext = createContext<AppState | undefined>(undefined);

export const compressImage = (base64: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(base64); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = (err) => reject(err);
  });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("AppProvider rendering...");
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);
  const [letterhead, setLetterhead] = useState<LetterheadConfig>({
    leaderName: "মোঃ আব্দুছ ছাবির (টুটুল)",
    designation: "সভাপতি",
    signature: "",
    stampText: "আজাদী সমাজ কল্যাণ সংঘ, সিলেট",
    bodyText: ""
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [cloudErrorMessage, setCloudErrorMessage] = useState<string | undefined>();
  const [cloudErrorType, setCloudErrorType] = useState<'auth' | 'network' | 'other' | undefined>();

  // Use refs to track first snapshot arrivals
  const loadedCollections = useRef(new Set<string>());

  useEffect(() => {
    const colls = ['settings', 'letterhead', 'donations', 'leadership', 'events', 'notices', 'news'];
    const checkAllLoaded = (collName: string) => {
      if (!isLoaded) {
        loadedCollections.current.add(collName);
        if (loadedCollections.current.size >= colls.length) {
          setIsLoaded(true);
        }
      }
    };

    let unsubscribes: any[] = [];
    try {
      const handleSyncError = (coll: string) => (err: any) => {
        console.warn(`Firestore subscription error for ${coll}:`, err);
        setCloudSynced(false);
        setCloudSyncStatus('error');
        if (err.code === 'permission-denied') {
          setCloudErrorType('auth');
          setCloudErrorMessage(lang === 'bn' ? 'ডাটাবেজ এক্সেস অনুমতি নেই। সিকিউরিটি রুল চেক করুন।' : 'Database access denied. Check security rules.');
        } else if (err.code === 'unavailable') {
          setCloudErrorType('network');
          setCloudErrorMessage(lang === 'bn' ? 'ইন্টারনেট কানেকশন নেই বা সার্ভার ডাউন।' : 'No internet connection or server is offline.');
        } else {
          setCloudErrorType('other');
          setCloudErrorMessage(err.message);
        }
        checkAllLoaded(coll); 
      };

      const handleSyncSuccess = (coll: string, dataSetter: (data: any) => void) => (data: any) => {
        dataSetter(data);
        setCloudSynced(true);
        setCloudSyncStatus('success');
        checkAllLoaded(coll);
      };

      unsubscribes = [
        subscribeSettings(handleSyncSuccess('settings', (data) => { 
          if(data) {
            setSettings(prev => ({ 
              ...prev, 
              ...data,
              nameBn: data.nameBn || prev.nameBn,
              nameEn: data.nameEn || prev.nameEn,
              sloganBn: data.sloganBn || prev.sloganBn,
              sloganEn: data.sloganEn || prev.sloganEn
            })); 
          }
        })),
        subscribeLetterhead(handleSyncSuccess('letterhead', (data) => { if(data) setLetterhead(prev => ({ ...prev, ...data })); })),
        subscribeCollection("donations", data => handleSyncSuccess('donations', setDonations)(data || []), handleSyncError('donations')),
        subscribeCollection("leadership", data => {
          const repaired = (data || []).map(l => ({ 
            ...l, 
            image: repairImageUrl(l.image || l.photo),
            status: l.status || 'active',
            createdAt: l.createdAt || new Date().toISOString()
          }));
          
          handleSyncSuccess('leadership', setLeadership)(repaired);
          
          // Auto-insert if empty and we are loaded
          if (repaired.length === 0 && auth.currentUser) {
            console.log("Leadership empty, auto-populating...");
            const initial = INITIAL_COMMITTEE.map((l, i) => ({
              ...l,
              id: `leader-${i + 1}`,
              image: "",
              messageEn: "",
              messageBn: "",
              phone: "",
              status: 'active',
              createdAt: new Date().toISOString()
            }));
            initial.forEach(member => saveItem("leadership", member.id, member));
          }
        }, handleSyncError('leadership')),
        subscribeCollection("events", data => {
          const repaired = (data || []).map(e => ({ ...e, image: repairImageUrl(e.image || e.photo) }));
          handleSyncSuccess('events', setEvents)(repaired);
        }, handleSyncError('events')),
        subscribeCollection("notices", data => handleSyncSuccess('notices', setNotices)(data || []), handleSyncError('notices')),
        subscribeCollection("news", data => handleSyncSuccess('news', setNews)(data || []), handleSyncError('news')),
      ];
    } catch (error) {
      console.error("Critical error during subscription initialization:", error);
      // Ensure we still try to load the app
      setIsLoaded(true);
    }

    const localLang = localStorage.getItem('azadi_lang') as Language;
    const localTheme = localStorage.getItem('azadi_theme') as 'light' | 'dark';
    
    if (localLang) setLang(localLang);
    if (localTheme) setTheme(localTheme);

    // Firebase Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // Admin check - either specific email or legacy session
      const isSystemAdmin = currentUser?.email === 'pavel4mutiara@gmail.com';
      const isLegacyAdmin = localStorage.getItem('azadi_admin_session') === 'true';
      
      setIsAdmin(isSystemAdmin || isLegacyAdmin);
      console.log("Auth State Changed:", currentUser?.email, "IsAdmin:", isSystemAdmin || isLegacyAdmin);
    });

    // Critical timeout to ensure isLoaded sets even if Firestore is slow or empty
    const timer = setTimeout(() => {
      console.log("AppProvider: Safety timeout reached. Forcing isLoaded=true");
      setIsLoaded(true);
    }, 1500); 

    // Emergency Failsafe listener
    const handleForceLoad = () => {
      console.log("AppProvider: Emergency force load event received");
      setIsLoaded(true);
    };
    window.addEventListener('force-app-load', handleForceLoad);
    
    // Add a global way to bypass the loading screen if it's stuck
    (window as any).bypassLoading = () => {
      console.log("AppProvider: Bypassing loading screen manually");
      setIsLoaded(true);
    };

    return () => {
      unsubscribes.forEach(unsub => unsub && typeof unsub === 'function' && unsub());
      unsubscribeAuth();
      clearTimeout(timer);
      window.removeEventListener('force-app-load', handleForceLoad);
    };
  }, []);

  useEffect(() => { localStorage.setItem('azadi_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('azadi_theme', theme); }, [theme]);

  const login = async (username?: string, password?: string): Promise<boolean> => {
    if (!username || !password) return false;
    const u = username.toLowerCase();
    // Supporting both the requested Admin login and the traditional stable password
    if ((u === 'admin' && password === 'Milad2006') || (u === 'admin' && password === 'azadi1988')) { 
      setIsAdmin(true); 
      localStorage.setItem('azadi_admin_session', 'true');
      return true; 
    }
    return false;
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      localStorage.removeItem('azadi_admin_session');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const restoreFromLegacy = async () => {
    try {
      const legacy = await getLegacyData();
      if (!legacy) {
        console.log("No legacy data found to restore.");
        alert(lang === 'bn' ? 'কোন পুরনো ডাটা পাওয়া যায়নি।' : 'No legacy data found.');
        return;
      }

      console.log("Restoring legacy data...");
      
      // Restore Leadership
      if (legacy.leadership && Array.isArray(legacy.leadership)) {
        for (const l of legacy.leadership) {
          await saveItem("leadership", l.id || `l-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, {
            ...l,
            image: repairImageUrl(l.image || l.photo || l.avatar)
          });
        }
      }

      // Restore Events
      if (legacy.events && Array.isArray(legacy.events)) {
        for (const e of legacy.events) {
          await saveItem("events", e.id || `e-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, {
            ...e,
            image: repairImageUrl(e.image || e.photo)
          });
        }
      }

      // Restore Settings
      if (legacy.settings) {
        await saveSettingsCloud({
          ...legacy.settings,
          logo: repairImageUrl(legacy.settings.logo),
          flag: repairImageUrl(legacy.settings.flag)
        });
      }

      // Restore Other collections
      const collections = ["donations", "notices", "news"];
      for (const coll of collections) {
        if (legacy[coll] && Array.isArray(legacy[coll])) {
          for (const item of legacy[coll]) {
            await saveItem(coll, item.id || `${coll.charAt(0)}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, item);
          }
        }
      }

      alert(lang === 'bn' ? 'পুরনো ডাটাবেজ সফলভাবে উদ্ধার করা হয়েছে এবং ইমেজ মেরামত করা হয়েছে!' : 'Old database recovered and images repaired successfully!');
      window.location.reload();
    } catch (err) {
      console.error("Restoration error:", err);
      alert("Error during restoration: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <AppContext.Provider value={{
      lang, theme, isAdmin, user, authLoading, donations, leadership, events, notices, news, settings, letterhead, isLoaded, cloudSynced, cloudSyncStatus, cloudErrorMessage, cloudErrorType,
      setLang, setTheme, login, loginWithGoogle, logout,
      
      addDonation: (d) => {
        const id = Date.now().toString();
        saveItem("donations", id, { ...d, id, status: isAdmin ? DonationStatus.APPROVED : DonationStatus.PENDING, date: new Date().toISOString() });
      },
      updateDonation: (id, status) => {
        const donation = donations.find(d => d.id === id);
        if (donation) saveItem("donations", id, { ...donation, status });
      },
      deleteDonation: (id) => deleteItem("donations", id),

      saveSettings: (s) => saveSettingsCloud(s),
      saveLetterhead: (c) => saveLetterheadCloud(c),

      updateLeadership: (list) => list.forEach(l => saveItem("leadership", l.id, l)),
      updateEvents: (list) => list.forEach(e => saveItem("events", e.id, e)),
      updateNotices: (list) => list.forEach(n => saveItem("notices", n.id, n)),
      updateNews: (list) => list.forEach(n => saveItem("news", n.id, n)),

      saveLeader: (l) => saveItem("leadership", l.id || Date.now().toString(), l),
      deleteLeader: (id) => deleteItem("leadership", id),
      
      saveEvent: (e) => saveItem("events", e.id || Date.now().toString(), e),
      deleteEvent: (id) => deleteItem("events", id),

      saveNotice: (n) => saveItem("notices", n.id || Date.now().toString(), n),
      deleteNotice: (id) => deleteItem("notices", id),

      saveNews: (n) => saveItem("news", n.id || Date.now().toString(), n),
      deleteNews: (id) => deleteItem("news", id),

      retryCloudConnection: async () => {
        const enabled = await reEnableCloudNetwork();
        if (enabled) window.location.reload();
      },
      restoreFromLegacy
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
