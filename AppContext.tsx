
// AppContext.tsx: Manages global state including bilingual settings and cloud synchronization.
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
  cloudErrorType: 'api-disabled' | 'not-found' | 'billing-required' | 'auth' | 'none';
  // Added cloudErrorMessage property to fix error in AdminDashboard.tsx
  cloudErrorMessage: string;
  cloudSyncStatus: 'idle' | 'syncing' | 'error' | 'success';
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
  syncDatabase: () => void;
  retryCloudConnection: () => void;
}

const DB_NAME = 'AzadiSocietyAppDB_v1';
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
  adminWhatsApp: "8801711975488",
  bkash: "01711975488",
  nagad: "01711975488",
  roket: "01711975488"
};

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
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
    if (!base64Str || !base64Str.startsWith('data:image')) return resolve(base64Str);
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
      resolve(canvas.toDataURL('image/jpeg', 0.8));
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
  const [cloudErrorType, setCloudErrorType] = useState<'api-disabled' | 'not-found' | 'billing-required' | 'auth' | 'none'>('none');
  // Added cloudErrorMessage state
  const [cloudErrorMessage, setCloudErrorMessage] = useState('');
  const [cloudApiError, setCloudApiError] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');

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

      // Capture error message from cloud load
      const { data: cloudData, type, error } = await loadFromCloud();
      if (type) {
        setCloudApiError(true);
        setCloudErrorType(type as any);
        if (error) setCloudErrorMessage(error);
      } else if (cloudData) {
        if (cloudData.settings?.nameBn) setSettings(cloudData.settings);
        if (cloudData.leadership?.length) setLeadership(cloudData.leadership);
        if (cloudData.donations) setDonations(cloudData.donations);
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
        if (!cloudApiError) {
          const result = await saveToCloud(state);
          setCloudSynced(result.success);
          // Store error message if cloud save fails
          if (result.error) setCloudErrorMessage(result.error);
          if (result.type) {
            setCloudApiError(true);
            setCloudErrorType(result.type);
          }
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lang, theme, donations, leadership, events, financials, settings, letterhead, isLoaded, cloudApiError]);

  const login = (password: string) => {
    if (password === 'azadi1988') { setIsAdmin(true); return true; }
    return false;
  };

  return (
    <AppContext.Provider value={{
      lang, theme, isAdmin, donations, leadership, events, financials, settings, letterhead, isLoaded, cloudSynced, cloudApiError, cloudErrorType, cloudErrorMessage, cloudSyncStatus,
      setLang, setTheme, login, logout: () => setIsAdmin(false),
      addDonation: (d) => {
        const newD = { ...d, id: Date.now().toString(), status: isAdmin ? DonationStatus.APPROVED : DonationStatus.PENDING, date: new Date().toISOString() };
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
      syncDatabase: async () => {
        setCloudSyncStatus('syncing');
        const { data: cloudData, error, type } = await loadFromCloud();
        if (cloudData) {
          if (cloudData.donations) setDonations(cloudData.donations);
          if (cloudData.settings) setSettings(cloudData.settings);
          setCloudSyncStatus('success');
          setCloudSynced(true);
        } else {
          setCloudSyncStatus('error');
          if (error) setCloudErrorMessage(error);
          if (type) setCloudErrorType(type);
        }
      },
      retryCloudConnection: async () => {
        const enabled = await reEnableCloudNetwork();
        if (enabled) window.location.reload();
      }
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
