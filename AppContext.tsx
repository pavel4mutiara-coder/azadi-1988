
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

const LOGO_ID = "1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh";
const NEW_LOGO_URL = `https://lh3.googleusercontent.com/d/${LOGO_ID}`;

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
  logo: NEW_LOGO_URL,
  flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/200px-Flag_of_Bangladesh.svg.png",
  adminWhatsApp: "8801711975488",
  bkash: "01711975488",
  nagad: "01711975488",
  roket: "01711975488",
  facebook: "https://www.facebook.com/profile.php?id=61585193438030",
  youtube: "https://youtube.com/@azadisocialwelfareorganization?si=gD7Akj6EdMYjHuFe",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb7KLIx0AgW4u9K4aw1k"
};

const DEFAULT_LEADERSHIP: Leadership[] = [
  { id: 'l1', nameEn: 'Md. Abdus Sabir (Tutul)', nameBn: 'মোঃ আব্দুছ ছাবির (টুটুল)', designationEn: 'President', designationBn: 'সভাপতি', messageEn: '', messageBn: '', phone: '01711975488', image: NEW_LOGO_URL, order: 1 },
  { id: 'l2', nameEn: 'Adv. Shahanur', nameBn: 'এস এস নুরুল হুদা চৌঃ (এডঃ শাহানুর)', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 2 },
  { id: 'l3', nameEn: 'Aminur Rahman (Shamim)', nameBn: 'আমিনুর রহমান (শামীম)', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 3 },
  { id: 'l4', nameEn: 'Jubed Ahmad', nameBn: 'জুবেদ আহমদ', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 4 },
  { id: 'l5', nameEn: 'Junel Ahmad', nameBn: 'জুনেল আহমদ', designationEn: 'General Secretary', designationBn: 'সাধারণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 5 },
  { id: 'l6', nameEn: 'Kawser Ahmad (Pappu)', nameBn: 'কাওসার আহমদ (পাপ্পু)', designationEn: 'Asst. General Secretary', designationBn: 'সহ-সাধারণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 6 },
  { id: 'l7', nameEn: 'Tareq Ahmad', nameBn: 'তারেক আহমদ', designationEn: 'Organizing Secretary', designationBn: 'সাংগঠনিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 7 },
  { id: 'l8', nameEn: '', nameBn: '', designationEn: 'Asst. Organizing Secretary', designationBn: 'সহ-সাংগঠনিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 8 },
  { id: 'l9', nameEn: 'Najib Salam', nameBn: 'নাজিব সালাম', designationEn: 'Social Welfare Secretary', designationBn: 'সমাজ কল্যাণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 9 },
  { id: 'l10', nameEn: 'Samin Ahmad Limon', nameBn: 'সামিন আহমদ লিমন', designationEn: 'Asst. Social Welfare Secretary', designationBn: 'সহ-সমাজ কল্যাণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 10 },
  { id: 'l11', nameEn: 'Abdul Malik (Biplob)', nameBn: 'আব্দুল মালিক (বিপ্লব)', designationEn: 'Treasurer', designationBn: 'অর্থ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 11 },
  { id: 'l12', nameEn: 'Abdul Hadi (Rumman)', nameBn: 'আব্দুল হাদী (রুম্মান)', designationEn: 'Asst. Treasurer', designationBn: 'সহ-অর্থ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 12 },
  { id: 'l13', nameEn: 'Arafat Islam (Boni)', nameBn: 'আরাফাত ইসলাম (বনি)', designationEn: 'Publicity Secretary', designationBn: 'প্রচার সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 13 },
  { id: 'l14', nameEn: '', nameBn: '', designationEn: 'Asst. Publicity Secretary', designationBn: 'সহ-প্রচার সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 14 },
  { id: 'l15', nameEn: 'Rafayat Malik (Rafi)', nameBn: 'রাফায়াত মালিক (রাফি)', designationEn: 'Sports Secretary', designationBn: 'ক্রীড়া সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 15 },
  { id: 'l16', nameEn: 'Harun Ahmad', nameBn: 'হারুণ আহমদ', designationEn: 'Asst. Sports Secretary', designationBn: 'সহ-ক্রীড়া সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 16 },
  { id: 'l17', nameEn: 'Nayeem Ahmad', nameBn: 'নাঈম আহমদ', designationEn: 'Religious Secretary', designationBn: 'ধর্ম সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 17 },
  { id: 'l18', nameEn: '', nameBn: '', designationEn: 'Asst. Religious Secretary', designationBn: 'সহ-ধর্ম সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 18 },
  { id: 'l19', nameEn: 'Shafayat Rasul (Alif)', nameBn: 'শাফায়াত রসুল (আলিফ)', designationEn: 'Education & Cultural Secretary', designationBn: 'শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 19 },
  { id: 'l20', nameEn: 'Aminul Islam (Nabil)', nameBn: 'আমিনুল ইসলাম (নাবিল)', designationEn: 'Asst. Education & Cultural Secretary', designationBn: 'সহ-শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 20 },
  { id: 'l21', nameEn: '', nameBn: '', designationEn: 'Women\'s Affairs Secretary', designationBn: 'মহিলা সম্পাদিকা', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 21 },
  { id: 'l22', nameEn: '', nameBn: '', designationEn: 'Asst. Women\'s Affairs Secretary', designationBn: 'সহ-মহিলা সম্পাদিকা', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 22 },
  { id: 'l23', nameEn: '', nameBn: '', designationEn: 'Office Secretary', designationBn: 'দপ্তর সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 23 },
  { id: 'l24', nameEn: '', nameBn: '', designationEn: 'Asst. Office Secretary', designationBn: 'সহ-দপ্তর সম্পাদক', messageEn: '', messageBn: '', phone: '', image: NEW_LOGO_URL, order: 24 }
];

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
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }
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
  const [leadership, setLeadership] = useState<Leadership[]>(DEFAULT_LEADERSHIP);
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
  const [cloudErrorMessage, setCloudErrorMessage] = useState('');
  const [cloudApiError, setCloudApiError] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');

  // Critical Logic: Show App Immediately using Local Storage
  useEffect(() => {
    const startApp = async () => {
      // 1. First, load from local storage to show UI immediately
      const localData = await dbLoad();
      if (localData) {
        if (localData.lang) setLang(localData.lang);
        if (localData.theme) setTheme(localData.theme);
        if (localData.donations) setDonations(localData.donations);
        if (localData.leadership && localData.leadership.length > 0) setLeadership(localData.leadership);
        if (localData.events) setEvents(localData.events);
        if (localData.financials) setFinancials(localData.financials);
        if (localData.settings) setSettings({ ...DEFAULT_SETTINGS, ...localData.settings, logo: NEW_LOGO_URL });
        if (localData.letterhead) setLetterhead(localData.letterhead);
      }
      
      // 2. Mark as loaded so UI appears instantly
      setIsLoaded(true);

      // 3. Background: Sync from Cloud without blocking the user
      try {
        const { data: cloudData, type, error } = await loadFromCloud();
        if (type) {
          setCloudApiError(true);
          setCloudErrorType(type as any);
          if (error) setCloudErrorMessage(error);
        } else if (cloudData) {
          if (cloudData.settings) setSettings({ ...DEFAULT_SETTINGS, ...cloudData.settings, logo: NEW_LOGO_URL });
          if (cloudData.leadership?.length) setLeadership(cloudData.leadership);
          if (cloudData.donations) setDonations(cloudData.donations);
          if (cloudData.events) setEvents(cloudData.events);
          if (cloudData.financials) setFinancials(cloudData.financials);
          setCloudSynced(true);
        }
      } catch (err) {
        console.warn("Background cloud sync failed, continuing with local data.");
      }
    };
    startApp();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const state = { lang, theme, donations, leadership, events, financials, settings, letterhead };
      dbSave(state);
      
      // Background auto-save to cloud
      const timer = setTimeout(async () => {
        if (!cloudApiError) {
          const result = await saveToCloud(state);
          setCloudSynced(result.success);
        }
      }, 10000); // Wait 10s after changes to sync (debounced)
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
          if (cloudData.settings) setSettings({ ...DEFAULT_SETTINGS, ...cloudData.settings });
          if (cloudData.leadership?.length) setLeadership(cloudData.leadership);
          if (cloudData.events) setEvents(cloudData.events);
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
