
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
  flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/200px-Flag_of_Bangladesh.svg.png",
  adminWhatsApp: "8801711975488",
  bkash: "01711975488",
  nagad: "01711975488",
  roket: "01711975488",
  facebook: "https://facebook.com/Azadi1988",
  youtube: "https://youtube.com/@AzadiSocialWelfare",
  whatsappChannel: "https://whatsapp.com"
};

// Full Committee Leadership Data provided by User
const DEFAULT_LEADERSHIP: Leadership[] = [
  { id: 'p1', nameEn: 'Md. Abdus Sabir (Tutul)', nameBn: 'মোঃ আব্দুছ ছাবির (টুটুল)', designationEn: 'President', designationBn: 'সভাপতি', messageEn: '', messageBn: '', phone: '01711975488', image: DEFAULT_SETTINGS.logo, order: 1 },
  { id: 'vp1', nameEn: 'Adv. Shahanur', nameBn: 'এস এস নুরুল হুদা চৌঃ (এডঃ শাহানুর)', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 2 },
  { id: 'vp2', nameEn: 'Aminur Rahman (Shamim)', nameBn: 'আমিনুর রহমান (শামীম)', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 3 },
  { id: 'vp3', nameEn: 'Jubed Ahmad', nameBn: 'জুবেদ আহমদ', designationEn: 'Vice President', designationBn: 'সহ-সভাপতি', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 4 },
  { id: 'gs1', nameEn: 'Junel Ahmad', nameBn: 'জুনেল আহমদ', designationEn: 'General Secretary', designationBn: 'সাধারণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 5 },
  { id: 'ags1', nameEn: 'Kawser Ahmad (Pappu)', nameBn: 'কাওসার আহমদ (পাপ্পু)', designationEn: 'Asst. General Secretary', designationBn: 'সহ-সাধারণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 6 },
  { id: 'os1', nameEn: 'Tareq Ahmad', nameBn: 'তারেক আহমদ', designationEn: 'Organizing Secretary', designationBn: 'সাংগঠনিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 7 },
  { id: 'os2', nameEn: '', nameBn: '', designationEn: 'Asst. Organizing Secretary', designationBn: 'সহ-সাংগঠনিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 8 },
  { id: 'sws1', nameEn: 'Najib Salam', nameBn: 'নাজিব সালাম', designationEn: 'Social Welfare Secretary', designationBn: 'সমাজ কল্যাণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 9 },
  { id: 'sws2', nameEn: 'Samin Ahmad Limon', nameBn: 'সামিন আহমদ লিমন', designationEn: 'Asst. Social Welfare Secretary', designationBn: 'সহ-সমাজ কল্যাণ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 10 },
  { id: 'trs1', nameEn: 'Abdul Malik (Biplob)', nameBn: 'আব্দুল মালিক (বিপ্লব)', designationEn: 'Treasurer', designationBn: 'অর্থ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 11 },
  { id: 'trs2', nameEn: 'Abdul Hadi (Rumman)', nameBn: 'আব্দুল হাদী (রুম্মান)', designationEn: 'Asst. Treasurer', designationBn: 'সহ-অর্থ সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 12 },
  { id: 'pubs1', nameEn: 'Arafat Islam (Boni)', nameBn: 'আরাফাত ইসলাম (বনি)', designationEn: 'Publicity Secretary', designationBn: 'প্রচার সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 13 },
  { id: 'pubs2', nameEn: '', nameBn: '', designationEn: 'Asst. Publicity Secretary', designationBn: 'সহ-প্রচার সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 14 },
  { id: 'sps1', nameEn: 'Rafayat Malik (Rafi)', nameBn: 'রাফায়াত মালিক (রাফি)', designationEn: 'Sports Secretary', designationBn: 'ক্রীড়া সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 15 },
  { id: 'sps2', nameEn: 'Harun Ahmad', nameBn: 'হারুণ আহমদ', designationEn: 'Asst. Sports Secretary', designationBn: 'সহ-ক্রীড়া সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 16 },
  { id: 'rels1', nameEn: 'Nayeem Ahmad', nameBn: 'নাঈম আহমদ', designationEn: 'Religious Secretary', designationBn: 'ধর্ম সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 17 },
  { id: 'rels2', nameEn: '', nameBn: '', designationEn: 'Asst. Religious Secretary', designationBn: 'সহ-ধর্ম সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 18 },
  { id: 'edus1', nameEn: 'Shafayat Rasul (Alif)', nameBn: 'শাফায়াত রসুল (আলিফ)', designationEn: 'Education & Cultural Secretary', designationBn: 'শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 19 },
  { id: 'edus2', nameEn: 'Aminul Islam (Nabil)', nameBn: 'আমিনুল ইসলাম (নাবিল)', designationEn: 'Asst. Education & Cultural Secretary', designationBn: 'সহ-শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 20 },
  { id: 'wom1', nameEn: '', nameBn: '', designationEn: 'Women\'s Affairs Secretary', designationBn: 'মহিলা সম্পাদিকা', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 21 },
  { id: 'wom2', nameEn: '', nameBn: '', designationEn: 'Asst. Women\'s Affairs Secretary', designationBn: 'সহ-মহিলা সম্পাদিকা', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 22 },
  { id: 'off1', nameEn: '', nameBn: '', designationEn: 'Office Secretary', designationBn: 'দপ্তর সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 23 },
  { id: 'off2', nameEn: '', nameBn: '', designationEn: 'Asst. Office Secretary', designationBn: 'সহ-দপ্তর সম্পাদক', messageEn: '', messageBn: '', phone: '', image: DEFAULT_SETTINGS.logo, order: 24 }
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
        if (localData.leadership?.length > 5) setLeadership(localData.leadership);
        else setLeadership(DEFAULT_LEADERSHIP);
        if (localData.events) setEvents(localData.events);
        if (localData.financials) setFinancials(localData.financials);
        if (localData.settings) {
          setSettings({ 
            ...DEFAULT_SETTINGS, 
            ...localData.settings,
            logo: localData.settings.logo || DEFAULT_SETTINGS.logo 
          });
        }
        if (localData.letterhead) setLetterhead(localData.letterhead);
      } else {
        setLeadership(DEFAULT_LEADERSHIP);
      }

      const { data: cloudData, type, error } = await loadFromCloud();
      if (type) {
        setCloudApiError(true);
        setCloudErrorType(type as any);
        if (error) setCloudErrorMessage(error);
      } else if (cloudData) {
        if (cloudData.settings?.nameBn) setSettings({ ...DEFAULT_SETTINGS, ...cloudData.settings });
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
          if (cloudData.settings) setSettings({ ...DEFAULT_SETTINGS, ...cloudData.settings });
          if (cloudData.leadership?.length) setLeadership(cloudData.leadership);
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
