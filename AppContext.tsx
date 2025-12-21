
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Donation, Leadership, Event, FinancialRecord, OrganizationSettings, LetterheadConfig, DonationStatus } from './types';
import { saveToCloud, loadFromCloud, reEnableCloudNetwork } from './firebase';

interface AppState {
  lang: Language;
  theme: 'light' | 'dark';
  isAdmin: boolean;
  donations: Donation[];
  leadership: Leadership[];
  events: Event[];
  financials: FinancialRecord[];
  settings: OrganizationSettings;
  letterhead: LetterheadConfig;
  isLoaded: boolean;
  cloudSynced: boolean;
  cloudApiError: boolean;
  setLang: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (password: string) => boolean;
  logout: () => void;
  addDonation: (donation: Omit<Donation, 'id' | 'status' | 'date'>) => void;
  updateDonation: (id: string, status: DonationStatus) => void;
  deleteDonation: (id: string) => void;
  saveSettings: (settings: OrganizationSettings) => void;
  saveLetterhead: (config: LetterheadConfig) => void;
  addFinancialRecord: (record: Omit<FinancialRecord, 'id' | 'date'>) => void;
  updateLeadership: (leadership: Leadership[]) => void;
  updateEvents: (events: Event[]) => void;
  clearAllData: () => void;
  syncDatabase: () => void;
  retryCloudConnection: () => void;
}

const DB_NAME = 'AzadiSocietyPermanentDB';
const STORE_NAME = 'permanent_storage';

const DEFAULT_SETTINGS: OrganizationSettings = {
  nameBn: "আজাদী সমাজ কল্যাণ সংঘ",
  nameEn: "Azadi Social Welfare Organization",
  sloganBn: "শিক্ষা · ঐক্য · সেবা · শান্তি · ক্রীড়া",
  sloganEn: "Education · Unity · Service · Peace · Sports",
  addressBn: "রোড নং ০১, ওয়ার্ড নং ১৭, মিরবক্সটুলা, সিলেট, বাংলাদেশ",
  addressEn: "Road No. 01, Ward No. 17, Mirbox Tula, Sylhet, Bangladesh",
  phone: "+8801711975488",
  email: "azadisocialwelfareorganization@gmail.com",
  establishedBn: "১০ জুন ১৯৮৮ (২৭ শে জৈষ্ঠ ১৩৯৫)",
  establishedEn: "10 June 1988",
  logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop",
  flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/200px-Flag_of_Bangladesh.svg.png",
  adminWhatsApp: "88017111975488",
  bkash: "01711975488",
  nagad: "01711975488",
  roket: "01711975488"
};

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const dbSave = async (data: any) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(JSON.parse(JSON.stringify(data)), 'app_state');
  return tx.oncomplete;
};

const dbLoad = async () => {
  const db = await initDB();
  return new Promise<any>((resolve) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get('app_state');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
};

export const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAdmin, setIsAdmin] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);
  const [letterhead, setLetterhead] = useState<LetterheadConfig>({
    leaderName: "মোঃ আব্দুছ ছাবির (টুটুল)",
    designation: "সভাপতি",
    signature: "",
    stampText: "আজাদী সমাজ কল্যাণ সংঘ, সিলেট",
    bodyText: ""
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [cloudApiError, setCloudApiError] = useState(localStorage.getItem('azadi_cloud_disabled') === 'true');

  useEffect(() => {
    const startApp = async () => {
      const localData = await dbLoad();
      if (localData) {
        if (localData.lang) setLang(localData.lang);
        if (localData.theme) setTheme(localData.theme);
        if (localData.donations) setDonations(localData.donations);
        if (localData.leadership) setLeadership(localData.leadership);
        if (localData.events) setEvents(localData.events);
        if (localData.financials) setFinancials(localData.financials);
        if (localData.settings) setSettings(localData.settings);
        if (localData.letterhead) setLetterhead(localData.letterhead);
      }

      const { data: cloudData, apiDisabled } = await loadFromCloud();
      if (apiDisabled) {
        setCloudApiError(true);
      } else {
        setCloudApiError(false);
      }
      
      if (cloudData) {
        setDonations(cloudData.donations || []);
        setLeadership(cloudData.leadership || []);
        setEvents(cloudData.events || []);
        setFinancials(cloudData.financials || []);
        setSettings(cloudData.settings || DEFAULT_SETTINGS);
        setLetterhead(cloudData.letterhead || { leaderName: "...", designation: "...", signature: "", stampText: "...", bodyText: "" });
        setCloudSynced(true);
      }
      setIsLoaded(true);
    };
    startApp();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const state = { lang, theme, donations, leadership, events, financials, settings, letterhead };
      dbSave(state);
      
      const timer = setTimeout(async () => {
        const result = await saveToCloud(state);
        setCloudSynced(result.success);
        if (result.apiDisabled) {
          setCloudApiError(true);
        } else {
          setCloudApiError(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lang, theme, donations, leadership, events, financials, settings, letterhead, isLoaded]);

  const login = (password: string) => {
    if (password === 'azadi1988') { setIsAdmin(true); return true; }
    return false;
  };

  const clearAllData = async () => {
    if (window.confirm("আপনি কি নিশ্চিত যে সব ডাটা মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব নয়।")) {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => window.location.reload();
    }
  };

  const syncDatabase = async () => {
    const { data: cloudData, apiDisabled } = await loadFromCloud();
    if (apiDisabled) {
      alert("Cloud API is still disabled. Please enable it in the Google Cloud Console first.");
      return;
    }
    
    if (cloudData) {
      alert("Cloud Sync Successful!");
      window.location.reload();
    } else {
      alert("No data found or connection issue. Trying to push local data...");
      const state = { lang, theme, donations, leadership, events, financials, settings, letterhead };
      await saveToCloud(state);
    }
  };

  const retryCloudConnection = async () => {
    await reEnableCloudNetwork();
    const result = await saveToCloud({ lang, theme, donations, leadership, events, financials, settings, letterhead });
    if (result.success) {
      setCloudSynced(true);
      setCloudApiError(false);
      alert("Database Connected Successfully!");
    } else {
      alert("Still unable to connect. Did you click 'Enable' in the Cloud Console?");
    }
  };

  return (
    <AppContext.Provider value={{
      lang, theme, isAdmin, donations, leadership, events, financials, settings, letterhead, isLoaded, cloudSynced, cloudApiError,
      setLang, setTheme, login, logout: () => setIsAdmin(false),
      addDonation: (d) => {
        const newD = { ...d, id: Date.now().toString(), status: DonationStatus.PENDING, date: new Date().toISOString() };
        setDonations([newD, ...donations]);
      },
      updateDonation: (id, status) => setDonations(donations.map(d => d.id === id ? { ...d, status } : d)),
      deleteDonation: (id) => setDonations(donations.filter(d => d.id !== id)),
      saveSettings: (s) => setSettings(s),
      saveLetterhead: (c) => setLetterhead(c),
      addFinancialRecord: (r) => {
        const newR = { ...r, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] };
        setFinancials([newR, ...financials]);
      },
      updateLeadership: (l) => setLeadership(l),
      updateEvents: (ev) => setEvents(ev),
      clearAllData,
      syncDatabase,
      retryCloudConnection
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
