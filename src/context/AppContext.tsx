import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  VersionConfig,
  CollectionSyncState,
  Testimonial,
  AuditLog,
  PrivateDonorInfo,
  PublicDonationStats
} from '../types';
import { CURRENT_VERSION } from '../utils/version';
import { INITIAL_COMMITTEE } from '../utils/committee';
import { 
  collection, 
  collectionGroup,
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  getDoc,
  getDocs,
  getDocFromServer,
  writeBatch,
  updateDoc,
  addDoc
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
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  User as FirebaseUser
} from 'firebase/auth';

interface AppState {
  lang: Language;
  theme: 'light' | 'dark';
  isAdmin: boolean;
  user: FirebaseUser | null;
  authLoading: boolean;
  donations: Donation[];
  publicStats: PublicDonationStats | null;
  leadership: Leadership[];
  events: Event[];
  notices: Notice[];
  news: News[];
  expenses: Expense[];
  testimonials: Testimonial[];
  auditLogs: AuditLog[];
  settings: OrganizationSettings;
  letterhead: LetterheadConfig;
  isLoaded: boolean;
  cloudSynced: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'error' | 'success';
  syncError: string | null;
  cloudErrorMessage?: string;
  cloudErrorType?: 'auth' | 'network' | 'other';
  loadingDonations: boolean;
  loadingLeadership: boolean;
  loadingEvents: boolean;
  loadingNotices: boolean;
  loadingNews: boolean;
  loadingExpenses: boolean;
  loadingTestimonials: boolean;
  loadingAuditLogs: boolean;
  loadingSettings: boolean;
  loadingLetterhead: boolean;
  setLang: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  login: (username?: string, password?: string) => Promise<{ success: boolean; message?: string; errorCode?: string }>;
  resetAdminPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyResetCode: (oobCode: string) => Promise<{ success: boolean; email?: string; message?: string; errorCode?: string }>;
  confirmNewPassword: (oobCode: string, newPassword: string) => Promise<{ success: boolean; message: string; errorCode?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addDonation: (donation: Donation) => Promise<void>;
  updateDonation: (id: string, status: DonationStatus) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  saveSettings: (settings: OrganizationSettings) => Promise<void>;
  saveLetterhead: (config: LetterheadConfig) => Promise<void>;
  updateLeadership: (leadership: Leadership[]) => Promise<void>;
  replaceLeadership: (leadership: Leadership[]) => Promise<void>;
  saveLeader: (leader: Leadership, originalLeader?: Leadership) => Promise<void>;
  deleteLeader: (id: string) => Promise<void>;
  saveEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  saveNotice: (notice: Notice) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  saveNews: (news: News) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  saveTestimonial: (testimonial: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  logAuditTrail: (action: string, targetCollection: string, targetDocId: string, details?: any) => Promise<void>;
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
  versionConfig: VersionConfig | null;
  saveVersionConfig: (config: VersionConfig) => Promise<void>;
  loadingVersion: boolean;
  syncHealth: CollectionSyncState[];
}

const DEFAULT_SETTINGS: OrganizationSettings = {
  nameBn: "",
  nameEn: "",
  sloganBn: "",
  sloganEn: "",
  addressBn: "",
  addressEn: "",
  phone: "",
  email: "",
  establishedBn: "",
  establishedEn: "",
  logo: "",
  flag: "",
  adminWhatsApp: "",
  bkash: "",
  nagad: "",
  roket: "",
  facebook: "",
  youtube: "",
  whatsappChannel: "",
  googleChatSpace: "",
  googleChatEnabled: false,
  googleChatNotifyOnReceipt: true,
  googleChatNotifyOnApproval: true,
  googleChatNotifyOnExpense: true
};

const DEFAULT_LETTERHEAD: LetterheadConfig = {
  leaderName: "",
  designation: "",
  signature: "",
  stampText: "",
  bodyText: ""
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('azadi_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('azadi_lang', newLang);
  };
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('azadi_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  // Firestore states (strictly initialized to empty/default; populated via snapshot listeners)
  const [rawDonations, setRawDonations] = useState<Donation[]>([]);
  const [privateDonorMap, setPrivateDonorMap] = useState<Map<string, PrivateDonorInfo>>(new Map());
  const [publicStats, setPublicStats] = useState<PublicDonationStats | null>(null);

  // Hydrate donations array with private donor details when user is authenticated admin
  const donations = useMemo(() => {
    if (!isAdmin || privateDonorMap.size === 0) return rawDonations;
    return rawDonations.map(d => {
      const priv = privateDonorMap.get(d.id);
      if (!priv) return d;
      return {
        ...d,
        donorName: (priv.donorName && priv.donorName.trim() !== '') ? priv.donorName : d.donorName,
        phone: priv.phone || d.phone,
        email: priv.email || d.email,
        address: priv.address || d.address,
        transactionId: priv.transactionId || d.transactionId,
        paymentReference: priv.paymentReference || d.paymentReference,
        privateNotes: priv.privateNotes || d.privateNotes
      };
    });
  }, [rawDonations, privateDonorMap, isAdmin]);
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);
  const [letterhead, setLetterhead] = useState<LetterheadConfig>(DEFAULT_LETTERHEAD);
  const [versionConfig, setVersionConfig] = useState<VersionConfig | null>(CURRENT_VERSION);
  const [isLoaded, setIsLoaded] = useState(true);

  const [loadingDonations, setLoadingDonations] = useState(true);
  const [loadingLeadership, setLoadingLeadership] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingLetterhead, setLoadingLetterhead] = useState(true);
  const [loadingVersion, setLoadingVersion] = useState(true);

  const [cloudSynced, setCloudSynced] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('success');
  const [syncError, setSyncError] = useState<string | null>(null);

  const [syncTimestamps, setSyncTimestamps] = useState<Record<string, { 
    firestore: string | null; 
    local: string | null; 
    source: 'server' | 'cache' | 'mock';
    fromCache: boolean;
    hasPendingWrites: boolean;
    error: string | null;
  }>>({
    settings: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    letterhead: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    donations: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    leadership: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    events: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    notices: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    news: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    expenses: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    testimonials: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    audit_logs: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    version: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    public_stats: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
    private_info: { firestore: null, local: new Date().toISOString(), source: 'mock', fromCache: false, hasPendingWrites: false, error: null },
  });

  const recordSyncEvent = (
    collectionName: string, 
    type: 'firestore' | 'local', 
    source: 'server' | 'cache' | 'mock' = 'server',
    meta?: { fromCache?: boolean; hasPendingWrites?: boolean },
    error: string | null = null
  ) => {
    setSyncTimestamps(prev => {
      const current = prev[collectionName] || { 
        firestore: null, 
        local: null, 
        source: 'mock',
        fromCache: false,
        hasPendingWrites: false,
        error: null
      };
      return {
        ...prev,
        [collectionName]: {
          firestore: type === 'firestore' ? new Date().toISOString() : current.firestore,
          local: type === 'local' ? new Date().toISOString() : current.local,
          source: type === 'firestore' ? source : current.source,
          fromCache: meta?.fromCache !== undefined ? meta.fromCache : (source === 'cache'),
          hasPendingWrites: meta?.hasPendingWrites !== undefined ? meta.hasPendingWrites : current.hasPendingWrites,
          error: error !== undefined ? error : current.error
        }
      };
    });
  };

  const syncHealth: CollectionSyncState[] = Object.entries(syncTimestamps).map(([name, ts]) => {
    let count = 0;
    if (name === 'settings') count = 1;
    else if (name === 'letterhead') count = 1;
    else if (name === 'donations') count = rawDonations.length;
    else if (name === 'leadership') count = leadership.length;
    else if (name === 'events') count = events.length;
    else if (name === 'notices') count = notices.length;
    else if (name === 'news') count = news.length;
    else if (name === 'expenses') count = expenses.length;
    else if (name === 'testimonials') count = testimonials.length;
    else if (name === 'audit_logs') count = auditLogs.length;
    else if (name === 'version') count = 1;
    else if (name === 'public_stats') count = publicStats ? 1 : 0;
    else if (name === 'private_info') count = privateDonorMap.size;

    let status: 'synced' | 'stale' | 'offline' | 'unknown' = 'unknown';
    if (ts.error) {
      status = 'offline';
    } else if (ts.fromCache || ts.source === 'cache') {
      status = 'offline';
    } else if (ts.source === 'mock') {
      status = 'unknown';
    } else if (ts.firestore) {
      status = 'synced';
    }

    return {
      collectionName: name,
      firestoreLastUpdated: ts.firestore,
      localLastUpdated: ts.local,
      status,
      metadataSource: ts.source,
      count,
      fromCache: ts.fromCache,
      hasPendingWrites: ts.hasPendingWrites,
      error: ts.error
    };
  });

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

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Purge legacy cached data and offline Firestore database instances from browser storage
  useEffect(() => {
    const keysToRemove = [
      'azadi_donations',
      'azadi_leadership',
      'azadi_events',
      'azadi_notices',
      'azadi_news',
      'azadi_expenses',
      'azadi_testimonials',
      'azadi_settings',
      'azadi_letterhead',
      'azadi_version_config',
      'azadi_donation_migration_completed'
    ];
    keysToRemove.forEach(key => {
      try { localStorage.removeItem(key); } catch {}
      try { sessionStorage.removeItem(key); } catch {}
    });

    if (typeof window !== 'undefined' && window.indexedDB && window.indexedDB.databases) {
      window.indexedDB.databases().then(dbs => {
        dbs.forEach(database => {
          if (database.name && (database.name.includes('firestore') || database.name.includes('firebase') || database.name.includes('azadi'))) {
            try { window.indexedDB.deleteDatabase(database.name); } catch {}
          }
        });
      }).catch(() => {});
    }

    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          try { caches.delete(name); } catch {}
        });
      }).catch(() => {});
    }
  }, []);

  // Listen for Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fast path: Check sessionStorage cache
        const cachedAdminKey = `azadi_admin_cached_uid_${currentUser.uid}`;
        if (sessionStorage.getItem(cachedAdminKey) === 'true') {
          setIsAdmin(true);
        }

        // Evaluate if user is admin
        const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL || 'azadisocialwelfareorganization@gmail.com').toLowerCase();
        const isSuperAdminEmail = currentUser.email ? currentUser.email.toLowerCase() === superAdminEmail : false;
        
        try {
          const adminRef = doc(db, 'admins', currentUser.uid);
          const adminDoc = await getDoc(adminRef);
          if (adminDoc.exists()) {
            setIsAdmin(true);
            sessionStorage.setItem(cachedAdminKey, 'true');
          } else if (isSuperAdminEmail) {
            // Self-seed admin document for superadmin
            await setDoc(adminRef, {
              email: currentUser.email,
              role: 'superadmin',
              createdAt: new Date().toISOString()
            });
            setIsAdmin(true);
            sessionStorage.setItem(cachedAdminKey, 'true');
          } else {
            setIsAdmin(false);
            sessionStorage.removeItem(cachedAdminKey);
          }
        } catch (e) {
          if (isSuperAdminEmail) {
            setIsAdmin(true);
            sessionStorage.setItem(cachedAdminKey, 'true');
          } else {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    }, (authError) => {
      console.warn("Firebase Auth state observer notice:", authError);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // 1. Core Public Real-time Listeners (Run once on mount and persist throughout session)
  useEffect(() => {
    // Purge any legacy cached data keys on boot to ensure Firestore is the sole source of truth
    try {
      ['azadi_donations', 'azadi_leadership', 'azadi_events', 'azadi_notices', 'azadi_news', 'azadi_expenses', 'azadi_settings', 'azadi_letterhead', 'azadi_testimonials', 'azadi_version_config'].forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }

    // Settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), { includeMetadataChanges: true }, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as OrganizationSettings;
        setSettings(data);
        recordSyncEvent('settings', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
        setSyncError(null);
      }
      setLoadingSettings(false);
    }, (error) => {
      console.warn("Settings listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'settings/config');
      recordSyncEvent('settings', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingSettings(false);
    });

    // Letterhead listener
    const unsubLetterhead = onSnapshot(doc(db, 'settings', 'letterhead'), { includeMetadataChanges: true }, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as LetterheadConfig;
        setLetterhead(data);
        recordSyncEvent('letterhead', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
        setSyncError(null);
      }
      setLoadingLetterhead(false);
    }, (error) => {
      console.warn("Letterhead listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'settings/letterhead');
      recordSyncEvent('letterhead', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingLetterhead(false);
    });

    // Version listener
    const unsubVersion = onSnapshot(doc(db, 'settings', 'version'), { includeMetadataChanges: true }, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as VersionConfig;
        setVersionConfig(data);
        recordSyncEvent('version', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
        setSyncError(null);
      } else {
        if (auth.currentUser) {
          const seedVersion = async () => {
            try {
              await setDoc(doc(db, 'settings', 'version'), CURRENT_VERSION);
            } catch (err) {
              console.warn("Initial version document write skipped for non-admin:", err);
            }
          };
          seedVersion();
        }
        setVersionConfig(CURRENT_VERSION);
      }
      setLoadingVersion(false);
    }, (error) => {
      console.warn("Version listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'settings/version');
      recordSyncEvent('version', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingVersion(false);
    });

    // Public Stats Listener
    const unsubPublicStats = onSnapshot(doc(db, 'public_stats', 'donations'), { includeMetadataChanges: true }, (snap) => {
      if (snap.exists()) {
        setPublicStats(snap.data() as PublicDonationStats);
        recordSyncEvent('public_stats', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
        setSyncError(null);
      }
    }, (error) => {
      console.warn("Public stats listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'public_stats/donations');
      recordSyncEvent('public_stats', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
    });

    // Donations listener (Public safe)
    const unsubDonations = onSnapshot(query(collection(db, 'donations'), limit(100)), { includeMetadataChanges: true }, (snap) => {
      const list: Donation[] = [];
      if (!snap.empty) {
        snap.forEach(d => {
          const item = d.data();
          list.push({ ...item, id: d.id } as Donation);
        });
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }
      setRawDonations(list);
      recordSyncEvent('donations', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
      setLoadingDonations(false);
      setSyncError(null);
    }, (error) => {
      console.warn("Donations snapshot listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'donations');
      recordSyncEvent('donations', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingDonations(false);
    });

    // Leadership listener
    const unsubLeadership = onSnapshot(query(collection(db, 'leadership'), limit(100)), { includeMetadataChanges: true }, (snap) => {
      const list: Leadership[] = [];
      if (!snap.empty) {
        snap.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as Leadership);
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      setLeadership(list);
      recordSyncEvent('leadership', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
      setLoadingLeadership(false);
      setSyncError(null);
    }, (error) => {
      console.warn("Leadership listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'leadership');
      recordSyncEvent('leadership', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingLeadership(false);
    });

    // Events listener
    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), limit(100)),
      { includeMetadataChanges: true },
      (snap) => {
        const isFromCache = snap.metadata.fromCache;
        const hasPendingWrites = snap.metadata.hasPendingWrites;

        const firestoreEvents: Event[] = [];
        if (!snap.empty) {
          snap.forEach(d => {
            const data = d.data();
            firestoreEvents.push({ ...data, id: d.id } as Event);
          });
        }

        const sortedEvents = firestoreEvents.sort((a, b) => {
          const dateA = String(a.date || "");
          const dateB = String(b.date || "");
          return dateB.localeCompare(dateA);
        });

        setEvents(sortedEvents);
        recordSyncEvent('events', 'firestore', isFromCache ? 'cache' : 'server', { fromCache: isFromCache, hasPendingWrites });
        setLoadingEvents(false);
        setSyncError(null);
      },
      (error) => {
        const msg = error?.message || String(error);
        if (msg.includes('Firestore shutting down') || (error as any)?.code === 'cancelled' || (error as any)?.code === 'aborted') {
          return;
        }
        handleFirestoreError(error, OperationType.GET, 'events');
        recordSyncEvent('events', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
        setSyncError(error?.message || String(error));
        setLoadingEvents(false);
      }
    );

    // Notices listener
    const unsubNotices = onSnapshot(query(collection(db, 'notices'), limit(100)), { includeMetadataChanges: true }, (snap) => {
      const list: Notice[] = [];
      if (!snap.empty) {
        snap.forEach(d => {
          const data = d.data();
          list.push({ ...data, id: d.id } as Notice);
        });
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }
      setNotices(list);
      recordSyncEvent('notices', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
      setLoadingNotices(false);
      setSyncError(null);
    }, (error) => {
      console.warn("Notices listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'notices');
      recordSyncEvent('notices', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingNotices(false);
    });

    // News listener
    const unsubNews = onSnapshot(query(collection(db, 'news'), limit(100)), { includeMetadataChanges: true }, (snap) => {
      const list: News[] = [];
      if (!snap.empty) {
        snap.forEach(d => {
          const data = d.data();
          list.push({ ...data, id: d.id } as News);
        });
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }
      setNews(list);
      recordSyncEvent('news', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
      setLoadingNews(false);
      setSyncError(null);
    }, (error) => {
      console.warn("News listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'news');
      recordSyncEvent('news', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingNews(false);
    });

    // Testimonials listener
    const unsubTestimonials = onSnapshot(query(collection(db, 'testimonials'), limit(100)), { includeMetadataChanges: true }, (snap) => {
      const list: Testimonial[] = [];
      if (!snap.empty) {
        snap.forEach(d => {
          const data = d.data();
          list.push({ ...data, id: d.id } as Testimonial);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }
      setTestimonials(list);
      recordSyncEvent('testimonials', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
      setLoadingTestimonials(false);
      setSyncError(null);
    }, (error) => {
      console.warn("Testimonials listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'testimonials');
      recordSyncEvent('testimonials', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingTestimonials(false);
    });

    return () => {
      unsubSettings();
      unsubLetterhead();
      unsubVersion();
      unsubPublicStats();
      unsubDonations();
      unsubLeadership();
      unsubEvents();
      unsubNotices();
      unsubNews();
      unsubTestimonials();
    };
  }, []);

  // 2. Admin / Authenticated Restricted Real-time Listeners (Mounts only when admin authenticated)
  useEffect(() => {
    if (!isAdmin) {
      setLoadingAuditLogs(false);
      setLoadingExpenses(false);
      return;
    }

    // Auto-migrate legacy flat donation documents
    runDonationDataMigration();

    // Expenses listener
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), limit(100)), { includeMetadataChanges: true }, (snap) => {
      const list: Expense[] = [];
      if (!snap.empty) {
        snap.forEach(d => {
          const data = d.data();
          list.push({ ...data, id: d.id } as Expense);
        });
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }
      setExpenses(list);
      recordSyncEvent('expenses', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
      setLoadingExpenses(false);
      setSyncError(null);
    }, (error) => {
      console.warn("Expenses listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'expenses');
      recordSyncEvent('expenses', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingExpenses(false);
    });

    // Private donor info collectionGroup listener
    const unsubPrivateInfo = onSnapshot(query(collectionGroup(db, 'private_info')), { includeMetadataChanges: true }, (pSnap) => {
      const newMap = new Map<string, PrivateDonorInfo>();
      pSnap.forEach(pDoc => {
        const parentId = pDoc.ref.parent.parent?.id;
        if (parentId) {
          newMap.set(parentId, pDoc.data() as PrivateDonorInfo);
        }
      });
      setPrivateDonorMap(newMap);
      recordSyncEvent('private_info', 'firestore', pSnap.metadata.fromCache ? 'cache' : 'server', { fromCache: pSnap.metadata.fromCache, hasPendingWrites: pSnap.metadata.hasPendingWrites });
      setSyncError(null);
    }, (error) => {
      console.warn("Private info listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'private_info');
      recordSyncEvent('private_info', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
    });

    // Audit logs listener
    const unsubAuditLogs = onSnapshot(query(collection(db, 'audit_logs'), limit(100)), { includeMetadataChanges: true }, (snap) => {
      const list: AuditLog[] = [];
      if (!snap.empty) {
        snap.forEach(d => {
          const data = d.data();
          list.push({ ...data, id: d.id } as AuditLog);
        });
        list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      }
      setAuditLogs(list);
      recordSyncEvent('audit_logs', 'firestore', snap.metadata.fromCache ? 'cache' : 'server', { fromCache: snap.metadata.fromCache, hasPendingWrites: snap.metadata.hasPendingWrites });
      setLoadingAuditLogs(false);
      setSyncError(null);
    }, (error) => {
      console.warn("Audit logs listener notice:", error);
      handleFirestoreError(error, OperationType.GET, 'audit_logs');
      recordSyncEvent('audit_logs', 'firestore', 'cache', { fromCache: true, hasPendingWrites: false }, error?.message || String(error));
      setSyncError(error?.message || String(error));
      setLoadingAuditLogs(false);
    });

    return () => {
      unsubExpenses();
      unsubPrivateInfo();
      unsubAuditLogs();
    };
  }, [isAdmin]);

  // Database initialization step
  const seedDefaultDatabase = async () => {
    try {
      setCloudSyncStatus('syncing');
      await setDoc(doc(db, 'settings', 'config'), settings || DEFAULT_SETTINGS);
      await setDoc(doc(db, 'settings', 'letterhead'), letterhead || DEFAULT_LETTERHEAD);
      await setDoc(doc(db, 'settings', 'version'), CURRENT_VERSION);
      setCloudSyncStatus('success');
    } catch (error) {
      console.error("Initialization notice:", error);
      setCloudSyncStatus('error');
    }
  };

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

  const resetAdminPassword = async (emailInput: string): Promise<{ success: boolean; message: string }> => {
    if (!emailInput || !emailInput.trim()) {
      return { 
        success: false, 
        message: lang === 'bn' ? 'অনুগ্রহ করে ইমেল এড্রেসটি টাইপ করুন।' : 'Please enter an email address.' 
      };
    }
    const email = emailInput.includes('@') ? emailInput.trim() : `${emailInput.toLowerCase().trim()}@azadi.org`;
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/admin`,
        handleCodeInApp: true,
      };
      try {
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
      } catch (innerErr: any) {
        if (innerErr?.code === 'auth/unauthorized-continue-uri' || innerErr?.code === 'auth/invalid-continue-uri') {
          console.warn("Continue URL not authorized in Firebase Console, falling back to default action handler URL:", innerErr);
          await sendPasswordResetEmail(auth, email);
        } else {
          throw innerErr;
        }
      }
      return {
        success: true,
        message: lang === 'bn' 
          ? `${email} ঠিকানায় পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে! অনুগ্রহ করে আপনার ইনবক্স থেকে সর্বশেষ ইমেলের রিসেট লিংকে ক্লিক করুন (পুরনো লিংকগুলো অকার্যকর হবে)।` 
          : `Password reset link sent to ${email}! Please check your inbox and click the reset link in the NEWEST email received (older links become invalid).`
      };
    } catch (err: any) {
      console.error("Password reset error:", err);
      let msg = err.message || 'Failed to send reset email';
      if (err.code === 'auth/user-not-found') {
        msg = lang === 'bn' ? 'এই ইমেলের বিপরীতে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' : 'No account found for this email address.';
      } else if (err.code === 'auth/invalid-email') {
        msg = lang === 'bn' ? 'ইমেল এড্রেসটি সঠিক নয়।' : 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = lang === 'bn' ? 'অনেক বেশি চেষ্টার কারণে সাময়িকভাবে বন্ধ আছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'Too many requests. Please wait a while before trying again.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = lang === 'bn' ? 'নেটওয়ার্ক কানেকশন সমস্যা। ইন্টারনেট যাচাই করে পুনরায় চেষ্টা করুন।' : 'Network connection failed. Please check your internet connection.';
      } else if (err.code === 'auth/user-disabled') {
        msg = lang === 'bn' ? 'এই অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে।' : 'This account has been disabled.';
      }
      return { success: false, message: msg };
    }
  };

  const verifyResetCode = async (oobCode: string): Promise<{ success: boolean; email?: string; message?: string; errorCode?: string }> => {
    if (!oobCode || !oobCode.trim()) {
      return {
        success: false,
        message: lang === 'bn' ? 'রিসেট কোড পাওয়া যায়নি।' : 'Reset action code is missing.',
        errorCode: 'auth/invalid-action-code'
      };
    }
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      return { success: true, email };
    } catch (err: any) {
      console.error("verifyPasswordResetCode error:", err);
      let msg = err.message || 'Invalid or expired password reset link.';
      if (err.code === 'auth/expired-action-code') {
        msg = lang === 'bn' 
          ? 'পাসওয়ার্ড রিসেট লিংকটির মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নতুন একটি রিসেট লিংকের জন্য অনুরোধ করুন।' 
          : 'The password reset link has expired. Please request a new password reset link.';
      } else if (err.code === 'auth/invalid-action-code') {
        msg = lang === 'bn' 
          ? 'পাসওয়ার্ড রিসেট লিংকটি সঠিক নয় অথবা ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে নতুন একটি রিসেট লিংকের জন্য অনুরোধ করুন।' 
          : 'This password reset link is invalid or has already been used. Please request a new one.';
      } else if (err.code === 'auth/user-disabled') {
        msg = lang === 'bn' ? 'এই অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে।' : 'This administrator account has been disabled.';
      } else if (err.code === 'auth/user-not-found') {
        msg = lang === 'bn' ? 'এই রিসেট কোডের বিপরীতে কোনো ইউজার খুঁজে পাওয়া যায়নি।' : 'No account found matching this action code.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = lang === 'bn' ? 'নেটওয়ার্ক সংযোগ ব্যর্থ হয়েছে। ইন্টারনেট যাচাই করুন।' : 'Network connection failed. Please check your internet connection.';
      }
      return { success: false, message: msg, errorCode: err.code || 'unknown' };
    }
  };

  const confirmNewPassword = async (oobCode: string, newPassword: string): Promise<{ success: boolean; message: string; errorCode?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: lang === 'bn' ? 'পাসওয়ার্ড অত্যন্ত দুর্বল। অন্তত ৬টি অক্ষর ব্যবহার করুন।' : 'Password is too weak. Please use at least 6 characters.',
        errorCode: 'auth/weak-password'
      };
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      return {
        success: true,
        message: lang === 'bn' 
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।' 
          : 'Password updated successfully! You can now log in with your new password.'
      };
    } catch (err: any) {
      console.error("confirmPasswordReset error:", err);
      let msg = err.message || 'Failed to update password.';
      if (err.code === 'auth/expired-action-code') {
        msg = lang === 'bn' 
          ? 'পাসওয়ার্ড রিসেট লিংকটির মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার রিসেটের অনুরোধ পাঠান।' 
          : 'The password reset link has expired. Please request a new reset link.';
      } else if (err.code === 'auth/invalid-action-code') {
        msg = lang === 'bn' 
          ? 'এই পাসওয়ার্ড রিসেট লিংকটি ইতিমধ্যে ব্যবহৃত হয়েছে বা অকার্যকর।' 
          : 'This password reset link is invalid or has already been used.';
      } else if (err.code === 'auth/weak-password') {
        msg = lang === 'bn' ? 'পাসওয়ার্ড অত্যন্ত দুর্বল। অন্তত ৬টি অক্ষর ব্যবহার করুন।' : 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/user-disabled') {
        msg = lang === 'bn' ? 'আপনার অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে।' : 'This administrator account has been disabled.';
      } else if (err.code === 'auth/user-not-found') {
        msg = lang === 'bn' ? 'ইউজার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' : 'No account found matching this request.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = lang === 'bn' ? 'নেটওয়ার্ক ত্রুটি! ইন্টারনেট কানেকশন চেক করুন।' : 'Network connection error. Please check your internet connection and try again.';
      }
      return { success: false, message: msg, errorCode: err.code || 'unknown' };
    }
  };

  const login = async (username?: string, password?: string): Promise<{ success: boolean; message?: string; errorCode?: string }> => {
    if (!username || !password) {
      return { 
        success: false, 
        message: lang === 'bn' ? 'ইউজারনেম এবং পাসওয়ার্ড দুটিই প্রয়োজন।' : 'Both Username and Password are required.',
        errorCode: 'auth/missing-fields'
      };
    }
    
    // Support either direct email, or user typing 'admin' / other username (append @azadi.org if no @ symbol)
    const email = username.includes('@') ? username.trim() : `${username.toLowerCase().trim()}@azadi.org`;

    try {
      // 1. Attempt Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      
      // Determine if they are authorized admins (either database check or superadmin email)
      const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL || 'azadisocialwelfareorganization@gmail.com').toLowerCase();
      const isSuperAdminEmail = currentUser.email ? currentUser.email.toLowerCase() === superAdminEmail : false;
      
      let isAuthorizedAdmin = false;
      try {
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        if (adminDoc.exists() || isSuperAdminEmail) {
          isAuthorizedAdmin = true;
          if (isSuperAdminEmail && (!adminDoc.exists() || adminDoc.data()?.role !== 'superadmin')) {
            // Seed/update super admin record dynamically
            await setDoc(doc(db, 'admins', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'Super Admin',
              role: 'superadmin',
              active: true,
              createdAt: adminDoc.exists() ? adminDoc.data()?.createdAt || new Date().toISOString() : new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
      } catch (dbError) {
        console.warn("Could not check Firestore admin collection (possibly offline). Fallback to superadmin check.", dbError);
        if (isSuperAdminEmail) {
          isAuthorizedAdmin = true;
        }
      }

      if (isAuthorizedAdmin) {
        setIsAdmin(true);
        return { success: true };
      } else {
        // Not authorized as an admin in Firestore admins collection
        await signOut(auth);
        setIsAdmin(false);
        return { 
          success: false, 
          message: lang === 'bn' 
            ? 'ইউজার অ্যাকাউন্ট সফলভাবে পাওয়া গেছে, কিন্তু এটিadmins রেজিস্ট্রিতে নিবন্ধিত নয়।' 
            : 'Authenticated successfully, but this account is not registered in the admins registry.',
          errorCode: 'auth/not-authorized'
        };
      }
    } catch (error: any) {
      console.error("Firebase auth login failed:", error);
      let msg = error.message || 'Authentication failed';
      const code = error.code || 'auth/unknown';
      if (code === 'auth/user-not-found') {
        msg = lang === 'bn' ? `এই অ্যাকাউন্টের (${email}) বিপরীতে কোনো নিবন্ধিত ইউজার পাওয়া যায়নি।` : `No account found for ${email}.`;
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = lang === 'bn' ? 'ভুল পাসওয়ার্ড। দয়া করে পাসওয়ার্ড যাচাই করুন অথবা রিসেট লিংক ব্যবহার করুন।' : 'Incorrect password. Please verify or use password reset.';
      } else if (code === 'auth/invalid-email') {
        msg = lang === 'bn' ? 'ইমেল এড্রেসের বিন্যাস সঠিক নয়।' : 'Invalid email format.';
      } else if (code === 'auth/too-many-requests') {
        msg = lang === 'bn' ? 'অতিরিক্ত চেষ্টার কারণে অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।' : 'Access temporarily blocked due to multiple failed login attempts. Try again later or reset password.';
      } else if (code === 'auth/network-request-failed') {
        msg = lang === 'bn' ? 'নেটওয়ার্ক সংযোগ ডাইরেক্ট বিচ্ছিন্ন হয়েছে। ইন্টারনেট কানেকশন চেক করুন।' : 'Network connection failed. Please check your internet.';
      }
      return { success: false, message: msg, errorCode: code };
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
  const logAuditTrail = async (action: string, targetCollection = 'system', targetDocId = 'general', details?: any) => {
    try {
      const logId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const cleanDetails = details ? (typeof details === 'object' ? JSON.stringify(details, (key, value) => {
        if (/password|secret|hash|credential/i.test(key)) return undefined;
        return value;
      }) : String(details)) : '';

      await setDoc(doc(db, 'audit_logs', logId), {
        id: logId,
        action,
        targetCollection,
        targetDocId,
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'anonymous',
        timestamp: new Date().toISOString(),
        details: cleanDetails
      });
    } catch (e) {
      console.warn("Audit logging failed:", e);
    }
  };

  const saveTestimonial = async (item: Testimonial) => {
    try {
      recordSyncEvent('testimonials', 'local');
      const docRef = doc(db, 'testimonials', item.id);
      await withSync(() => setDoc(docRef, item));
      await logAuditTrail(
        item.status === 'APPROVED' ? 'APPROVE_TESTIMONIAL' : 'SAVE_TESTIMONIAL',
        'testimonials',
        item.id,
        { nameEn: item.nameEn, status: item.status }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `testimonials/${item.id}`);
      throw error;
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      recordSyncEvent('testimonials', 'local');
      await withSync(() => deleteDoc(doc(db, 'testimonials', id)));
      await logAuditTrail('DELETE_TESTIMONIAL', 'testimonials', id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
      throw error;
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
  const withSync = async <T,>(operation: () => Promise<T>): Promise<T> => {
    setCloudSyncStatus('syncing');
    setCloudSynced(false);
    try {
      const result = await operation();
      setCloudSyncStatus('success');
      setCloudSynced(true);
      return result;
    } catch (error) {
      setCloudSyncStatus('error');
      setCloudSynced(false);
      throw error;
    }
  };

  // Helper to construct public safe donation object (strips sensitive phone, email, address, transactionId)
  const getPublicDonationDoc = (donation: Donation) => ({
    id: donation.id,
    donorName: donation.isAnonymous ? (lang === 'bn' ? 'বেনামী' : 'Anonymous') : (donation.donorName || 'Anonymous Giver'),
    isAnonymous: Boolean(donation.isAnonymous),
    amount: Number(donation.amount) || 0,
    purpose: donation.purpose || 'General Welfare',
    status: donation.status || DonationStatus.PENDING,
    date: donation.date || new Date().toISOString(),
    paymentMethod: donation.paymentMethod || 'bKash',
    receiptId: donation.receiptId || `REC-${donation.id.slice(-8)}`,
    isPublic: donation.isPublic !== false
  });

  // Helper to construct private donor info object
  const getPrivateInfoDoc = (donation: Donation) => ({
    donorName: donation.donorName || '',
    phone: donation.phone || '',
    email: donation.email || '',
    address: donation.address || '',
    transactionId: donation.transactionId || donation.id,
    paymentReference: donation.paymentReference || '',
    privateNotes: donation.privateNotes || ''
  });

  // Helper to calculate and sync public stats document (public_stats/donations)
  const updatePublicStatsAggregate = async (donationsList: Donation[]) => {
    try {
      const approvedList = donationsList.filter(d => d.status === DonationStatus.APPROVED);
      const stats: PublicDonationStats = {
        totalApprovedAmount: approvedList.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
        totalApprovedDonations: approvedList.length,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(doc(db, 'public_stats', 'donations'), stats);
      setPublicStats(stats);
    } catch (err) {
      console.warn("Public stats update notice:", err);
    }
  };

  // Safe migration helper: moves legacy flat donation fields to private_info subcollection
  const runDonationDataMigration = async () => {
    if (!auth.currentUser) return;
    if (localStorage.getItem('azadi_donation_migration_completed') === 'true') return;
    try {
      const snap = await getDocs(collection(db, 'donations'));
      let migratedCount = 0;
      const allDocs: Donation[] = [];
      for (const dDoc of snap.docs) {
        const data = dDoc.data();
        const id = dDoc.id;
        if (data.phone !== undefined || data.transactionId !== undefined || data.email !== undefined || data.address !== undefined) {
          const privateDetails = {
            donorName: data.donorName || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            transactionId: data.transactionId || id,
            paymentReference: data.paymentReference || '',
            privateNotes: data.privateNotes || ''
          };
          const publicDetails = {
            id,
            donorName: data.isAnonymous ? (lang === 'bn' ? 'বেনামী' : 'Anonymous') : (data.donorName || 'Anonymous Giver'),
            isAnonymous: Boolean(data.isAnonymous),
            amount: Number(data.amount) || 0,
            purpose: data.purpose || 'General Welfare',
            status: data.status || DonationStatus.PENDING,
            date: data.date || new Date().toISOString(),
            paymentMethod: data.paymentMethod || 'bKash',
            receiptId: data.receiptId || `REC-${id.slice(-8)}`,
            isPublic: data.isPublic !== false
          };
          await setDoc(doc(db, 'donations', id, 'private_info', 'details'), privateDetails);
          await setDoc(doc(db, 'donations', id), publicDetails);
          migratedCount++;
          allDocs.push({ ...publicDetails, ...privateDetails } as Donation);
        } else {
          allDocs.push({ ...data, id } as Donation);
        }
      }
      if (migratedCount > 0) {
        console.log(`[DATA MIGRATION] Migrated ${migratedCount} donation records to private subcollections.`);
      }
      await updatePublicStatsAggregate(allDocs);
      localStorage.setItem('azadi_donation_migration_completed', 'true');
    } catch (err) {
      console.warn("[DATA MIGRATION] Migration check notice:", err);
    }
  };

  const addDonation = async (donation: Donation) => {
    // Optimistic UI update
    setRawDonations(prev => {
      if (prev.some(d => d.id === donation.id)) {
        return prev.map(d => d.id === donation.id ? donation : d);
      }
      return [donation, ...prev];
    });
    recordSyncEvent('donations', 'local');

    try {
      const publicData = getPublicDonationDoc(donation);
      const privateData = getPrivateInfoDoc(donation);

      await withSync(() => setDoc(doc(db, 'donations', donation.id), publicData));
      await setDoc(doc(db, 'donations', donation.id, 'private_info', 'details'), privateData);

      const newDonationsList = [donation, ...rawDonations.filter(d => d.id !== donation.id)];
      await updatePublicStatsAggregate(newDonationsList);

      // Google Chat auto-trigger on new donation request submission
      if (settings.googleChatEnabled && settings.googleChatNotifyOnReceipt !== false) {
        console.log(`[DEBUG] Attempting to trigger Google Chat notification for donation: ${donation.id}, Donor: ${donation.donorName}, Amount: ৳${donation.amount}`);
        const donorLabel = donation.isAnonymous ? (lang === 'bn' ? 'বেনামী' : 'Anonymous') : (donation.donorName || 'Donor');
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
      handleFirestoreError(error, OperationType.WRITE, `donations/${donation.id}`);
    }
  };

  const updateDonation = async (id: string, status: DonationStatus) => {
    console.log("[DEBUG] updateDonation initiated. ID:", id, "Status update requested:", status);
    const existing = donations.find(d => d.id === id);
    if (!existing) {
      console.warn("[DEBUG] CRITICAL WARNING: Donation ID not found in the state array.");
    }
    const updatedDonation = { ...existing!, id, status };

    // Optimistic update
    setRawDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    recordSyncEvent('donations', 'local');

    try {
      if (auth.currentUser) {
        const publicData = getPublicDonationDoc(updatedDonation);
        const privateData = getPrivateInfoDoc(updatedDonation);

        await withSync(() => setDoc(doc(db, 'donations', id), publicData));
        await setDoc(doc(db, 'donations', id, 'private_info', 'details'), privateData);

        const updatedList = rawDonations.map(d => d.id === id ? updatedDonation : d);
        await updatePublicStatsAggregate(updatedList);

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
    const backupDonations = [...rawDonations];
    try {
      const target = donations.find(d => d.id === id);
      // Immediately remove from state
      setRawDonations(prev => prev.filter(d => d.id !== id));
      recordSyncEvent('donations', 'local');

      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'donations', id, 'private_info', 'details'));
        } catch (e) {
          console.warn("Private info deletion notice:", e);
        }
        await withSync(() => deleteDoc(doc(db, 'donations', id)));

        const updatedList = rawDonations.filter(d => d.id !== id);
        await updatePublicStatsAggregate(updatedList);

        await logAuditTrail('DONATION_DELETION', { donationId: id, donorName: target?.donorName, amount: target?.amount });
      }
      
      alert(lang === 'bn' ? 'অনুদান এন্ট্রিটি সফলভাবে মুছে ফেলা হয়েছে!' : 'Donation entry has been successfully deleted!');
    } catch (error) {
      console.warn("Firestore delete failed, reverting state:", error);
      setRawDonations(backupDonations);
      
      alert(lang === 'bn' 
        ? 'অনুদানটি মুছে ফেলা সম্ভব হয়নি! দয়া করে ইন্টারনেট কানেকশন চেক করুন অথবা পুনরায় লগইন করুন।' 
        : 'Could not delete the donation! Please check your internet connection and try again.'
      );
    }
  };

  const saveSettings = async (newSettings: OrganizationSettings) => {
    try {
      recordSyncEvent('settings', 'local');
      await withSync(() => setDoc(doc(db, 'settings', 'config'), newSettings));
      await logAuditTrail('SETTINGS_CONFIGURATION_UPDATE', { nameEn: newSettings.nameEn });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/config');
      throw error;
    }
  };

  const saveLetterhead = async (newLetterhead: LetterheadConfig) => {
    try {
      recordSyncEvent('letterhead', 'local');
      await withSync(() => setDoc(doc(db, 'settings', 'letterhead'), newLetterhead));
      await logAuditTrail('LETTERHEAD_CONFIGURATION_UPDATE', { leaderName: newLetterhead.leaderName });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/letterhead');
      throw error;
    }
  };

  const saveVersionConfig = async (newVersionConfig: VersionConfig) => {
    try {
      recordSyncEvent('version', 'local');
      await withSync(() => setDoc(doc(db, 'settings', 'version'), newVersionConfig));
      await logAuditTrail('VERSION_CONFIGURATION_UPDATE', { latestVersion: newVersionConfig.latestVersion });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/version');
      throw error;
    }
  };

  const updateLeadership = async (leadershipList: Leadership[]) => {
    for (const leader of leadershipList) {
      await saveLeader(leader);
    }
  };

  const replaceLeadership = async (leadershipList: Leadership[]) => {
    const listToSave = leadershipList;
    try {
      // Optimistic local state update
      setLeadership(listToSave);
      recordSyncEvent('leadership', 'local');
      
      const batch = writeBatch(db);
      const snap = await getDocs(collection(db, 'leadership'));
      
      // Delete existing documents
      for (const d of snap.docs) {
        batch.delete(d.ref);
      }
      
      // Add or rewrite new default documents with ID inside payload to satisfy security rules
      for (const l of listToSave) {
        batch.set(doc(db, 'leadership', l.id), l);
      }
      
      // Atomically commit batch to Firestore
      await withSync(() => batch.commit());
    } catch (error) {
      console.warn("Failed to replace leadership on server. Keeping local fallback state:", error);
      setLeadership(listToSave);
    }
  };

  const saveLeader = async (leader: Leadership, originalLeader?: Leadership) => {
    // Optimistic local state update
    const prevList = [...leadership];
    setLeadership(prev => {
      if (leader.id && prev.some(l => l.id === leader.id)) {
        return prev.map(l => l.id === leader.id ? leader : l).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      const tempId = leader.id || `temp_${Date.now()}`;
      return [...prev, { ...leader, id: tempId }].sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    recordSyncEvent('leadership', 'local');

    try {
      if (leader.id) {
        // This is an update (or a restore of an item with pre-defined ID)
        const leaderRef = doc(db, 'leadership', leader.id);
        const updatedLeader = {
          ...leader, // Keep 'id' inside the data to satisfy firestore security rules
          updatedAt: new Date().toISOString()
        };

        if (originalLeader) {
          try {
            const snap = await getDoc(leaderRef);
            if (snap.exists()) {
              const serverData = snap.data() as Leadership;
              // Optimistic concurrency check (OCC) with sanitized and trimmed fields to prevent false conflicts
              const serverUpdatedAt = (serverData as any).updatedAt || serverData.createdAt || '';
              const originalUpdatedAt = (originalLeader as any).updatedAt || originalLeader.createdAt || '';

              const cleanStr = (val: any) => String(val || '').trim();
              const cleanNum = (val: any) => Number(val || 0);

              const isModifiedOnServer = serverUpdatedAt !== originalUpdatedAt ||
                cleanStr(serverData.nameEn) !== cleanStr(originalLeader.nameEn) ||
                cleanStr(serverData.nameBn) !== cleanStr(originalLeader.nameBn) ||
                cleanStr(serverData.designationEn) !== cleanStr(originalLeader.designationEn) ||
                cleanStr(serverData.designationBn) !== cleanStr(originalLeader.designationBn) ||
                cleanStr(serverData.category) !== cleanStr(originalLeader.category) ||
                cleanStr(serverData.status) !== cleanStr(originalLeader.status) ||
                cleanNum(serverData.order) !== cleanNum(originalLeader.order) ||
                cleanStr(serverData.image) !== cleanStr(originalLeader.image) ||
                cleanStr(serverData.phone) !== cleanStr(originalLeader.phone) ||
                cleanStr(serverData.subDesignationEn) !== cleanStr(originalLeader.subDesignationEn) ||
                cleanStr(serverData.subDesignationBn) !== cleanStr(originalLeader.subDesignationBn) ||
                cleanStr(serverData.messageEn) !== cleanStr(originalLeader.messageEn) ||
                cleanStr(serverData.messageBn) !== cleanStr(originalLeader.messageBn);

              if (isModifiedOnServer) {
                throw new Error('EDIT_CONFLICT');
              }
            } else {
              throw new Error('DOCUMENT_NOT_FOUND');
            }
          } catch (docErr: any) {
            if (docErr.message === 'EDIT_CONFLICT' || docErr.message === 'DOCUMENT_NOT_FOUND') {
              throw docErr;
            }
            // If getDoc failed due to network / offline state, log warning and proceed with setDoc update
            console.warn("[saveLeader] getDoc check unavailable, proceeding with direct setDoc write:", docErr);
          }
        }

        // Single write update using setDoc merge which works whether document exists or not, and works offline
        await withSync(() => setDoc(leaderRef, updatedLeader as any, { merge: true }));
      } else {
        // Create a new document with Firestore's native auto-generated document ID (single write)
        const docRef = doc(collection(db, 'leadership'));
        const newLeaderData = {
          ...leader,
          id: docRef.id, // Store auto-generated ID inside payload to satisfy firestore rules
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await withSync(() => setDoc(docRef, newLeaderData));
      }
    } catch (error: any) {
      // Revert optimistic state on failure
      setLeadership(prevList);
      if (error.message === 'EDIT_CONFLICT' || error.message === 'DOCUMENT_NOT_FOUND') {
        throw error;
      }
      handleFirestoreError(error, OperationType.WRITE, `leadership/${leader.id || 'new'}`);
      throw error;
    }
  };

  const deleteLeader = async (id: string) => {
    const prevList = [...leadership];
    // Optimistic local state update
    setLeadership(prev => prev.filter(l => l.id !== id));
    recordSyncEvent('leadership', 'local');
    
    try {
      await withSync(() => deleteDoc(doc(db, 'leadership', id)));
    } catch (error) {
      // Revert optimistic state on failure
      setLeadership(prevList);
      handleFirestoreError(error, OperationType.DELETE, `leadership/${id}`);
      throw error;
    }
  };

  const saveEvent = async (event: Event) => {
    const prevList = [...events];
    try {
      recordSyncEvent('events', 'local');
      const cleanEvent: Event = {
        id: event.id,
        titleEn: event.titleEn || '',
        titleBn: event.titleBn || '',
        descriptionEn: event.descriptionEn || '',
        descriptionBn: event.descriptionBn || '',
        locationEn: event.locationEn || '',
        locationBn: event.locationBn || '',
        date: event.date || new Date().toISOString().split('T')[0],
        image: event.image || '',
        ...(event.meetUrl ? { meetUrl: event.meetUrl } : {})
      };

      // 1. Write to Firestore
      await withSync(() => setDoc(doc(db, 'events', cleanEvent.id), cleanEvent, { merge: true }));
      
      // 2. Confirm write reached Firestore server
      await getDoc(doc(db, 'events', cleanEvent.id));

      await logAuditTrail('SAVE_EVENT', 'events', cleanEvent.id, { titleEn: cleanEvent.titleEn });
    } catch (error) {
      setEvents(prevList);
      localStorage.setItem('azadi_events', JSON.stringify(prevList));
      handleFirestoreError(error, OperationType.WRITE, `events/${event.id}`);
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    const prevList = [...events];
    try {
      recordSyncEvent('events', 'local');
      await withSync(() => deleteDoc(doc(db, 'events', id)));
      await logAuditTrail('DELETE_EVENT', 'events', id);
    } catch (error) {
      setEvents(prevList);
      localStorage.setItem('azadi_events', JSON.stringify(prevList));
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
      throw error;
    }
  };

  const saveNotice = async (notice: Notice) => {
    const prevList = [...notices];
    try {
      recordSyncEvent('notices', 'local');
      const cleanNotice: Notice = {
        id: notice.id,
        titleEn: notice.titleEn || '',
        titleBn: notice.titleBn || '',
        contentEn: notice.contentEn || '',
        contentBn: notice.contentBn || '',
        date: notice.date || new Date().toISOString().split('T')[0],
        isUrgent: Boolean(notice.isUrgent)
      };

      await withSync(() => setDoc(doc(db, 'notices', cleanNotice.id), cleanNotice, { merge: true }));
      await getDoc(doc(db, 'notices', cleanNotice.id));
      await logAuditTrail('SAVE_NOTICE', 'notices', cleanNotice.id, { titleEn: cleanNotice.titleEn });
    } catch (error) {
      setNotices(prevList);
      localStorage.setItem('azadi_notices', JSON.stringify(prevList));
      handleFirestoreError(error, OperationType.WRITE, `notices/${notice.id}`);
      throw error;
    }
  };

  const deleteNotice = async (id: string) => {
    const prevList = [...notices];
    try {
      recordSyncEvent('notices', 'local');
      await withSync(() => deleteDoc(doc(db, 'notices', id)));
      await logAuditTrail('DELETE_NOTICE', 'notices', id);
    } catch (error) {
      setNotices(prevList);
      localStorage.setItem('azadi_notices', JSON.stringify(prevList));
      handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
      throw error;
    }
  };

  const saveNews = async (item: News) => {
    const prevList = [...news];
    try {
      recordSyncEvent('news', 'local');
      const cleanNews: News = {
        id: item.id,
        titleEn: item.titleEn || '',
        titleBn: item.titleBn || '',
        contentEn: item.contentEn || '',
        contentBn: item.contentBn || '',
        date: item.date || new Date().toISOString().split('T')[0],
        image: item.image || ''
      };

      await withSync(() => setDoc(doc(db, 'news', cleanNews.id), cleanNews, { merge: true }));
      await getDoc(doc(db, 'news', cleanNews.id));
      await logAuditTrail('SAVE_NEWS', 'news', cleanNews.id, { titleEn: cleanNews.titleEn });
    } catch (error) {
      setNews(prevList);
      localStorage.setItem('azadi_news', JSON.stringify(prevList));
      handleFirestoreError(error, OperationType.WRITE, `news/${item.id}`);
      throw error;
    }
  };

  const deleteNews = async (id: string) => {
    const prevList = [...news];
    try {
      recordSyncEvent('news', 'local');
      await withSync(() => deleteDoc(doc(db, 'news', id)));
      await logAuditTrail('DELETE_NEWS', 'news', id);
    } catch (error) {
      setNews(prevList);
      localStorage.setItem('azadi_news', JSON.stringify(prevList));
      handleFirestoreError(error, OperationType.DELETE, `news/${id}`);
      throw error;
    }
  };

  const addExpense = async (item: Expense) => {
    try {
      recordSyncEvent('expenses', 'local');
      await withSync(() => setDoc(doc(db, 'expenses', item.id), item));
      
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
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      recordSyncEvent('expenses', 'local');
      await withSync(() => deleteDoc(doc(db, 'expenses', id)));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
      throw error;
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
      publicStats,
      leadership, 
      events, 
      notices, 
      news, 
      expenses,
      testimonials,
      auditLogs,
      settings, 
      letterhead, 
      versionConfig,
      isLoaded, 
      cloudSynced, 
      cloudSyncStatus,
      syncError,
      loadingDonations,
      loadingLeadership,
      loadingEvents,
      loadingNotices,
      loadingNews,
      loadingExpenses,
      loadingTestimonials,
      loadingAuditLogs,
      loadingSettings,
      loadingLetterhead,
      loadingVersion,
      syncHealth,
      
      setLang, 
      setTheme, 
      login,
      resetAdminPassword,
      verifyResetCode,
      confirmNewPassword,
      loginWithGoogle,
      logout,
      
      addDonation,
      updateDonation,
      deleteDonation,
 
      saveSettings,
      saveLetterhead,
      saveVersionConfig,
 
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

      saveTestimonial,
      deleteTestimonial,
      logAuditTrail,

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

export const DiagnosticSyncPanel: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const { syncHealth, syncError, cloudSyncStatus, retryCloudConnection } = useApp();

  if (!import.meta.env.DEV) {
    return null;
  }

  const serverSyncedCount = syncHealth.filter(s => !s.fromCache && s.status === 'synced').length;
  const cacheCount = syncHealth.filter(s => s.fromCache).length;
  const pendingWritesCount = syncHealth.filter(s => s.hasPendingWrites).length;
  const errorCount = syncHealth.filter(s => !!s.error).length;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs select-none">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-md transition-all ${
            errorCount > 0 || syncError
              ? 'bg-red-950/90 text-red-200 border-red-700 hover:bg-red-900'
              : cacheCount > 0
              ? 'bg-amber-950/90 text-amber-200 border-amber-700 hover:bg-amber-900'
              : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
          }`}
          title="Click to view real-time Firestore sync diagnostics"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              errorCount > 0 ? 'bg-red-400' : cacheCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              errorCount > 0 ? 'bg-red-500' : cacheCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          </span>
          <span className="font-bold tracking-tight">Firestore DEV Sync</span>
          <span className="bg-slate-800/90 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
            {serverSyncedCount} Srv | {cacheCount} Cache
          </span>
          {pendingWritesCount > 0 && (
            <span className="bg-purple-900/80 text-purple-200 px-1.5 py-0.5 rounded text-[10px]">
              {pendingWritesCount} Pending
            </span>
          )}
        </button>
      ) : (
        <div className="w-80 sm:w-96 max-h-[85vh] flex flex-col bg-slate-950 text-slate-100 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                errorCount > 0 ? 'bg-red-500' : cacheCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <h3 className="font-semibold text-slate-200 text-xs">Firestore Sync Diagnostics</h3>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded">DEV</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => retryCloudConnection()}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Retry Cloud Connection"
              >
                ↻
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Minimize panel"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/60 border-b border-slate-800 text-[11px] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Global Sync Status:</span>
              <span className={`font-bold uppercase ${
                cloudSyncStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {cloudSyncStatus}
              </span>
            </div>
            {syncError && (
              <div className="p-2 rounded bg-red-950/90 border border-red-800 text-red-200 text-[10px] break-all leading-tight">
                ⚠️ <span className="font-bold">Sync Error:</span> {syncError}
              </div>
            )}
            <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="text-slate-400">Server Synced</div>
                <div className="font-bold text-emerald-400 text-sm">{serverSyncedCount}</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="text-slate-400">From Cache</div>
                <div className="font-bold text-amber-400 text-sm">{cacheCount}</div>
              </div>
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="text-slate-400">Pending Writes</div>
                <div className="font-bold text-purple-400 text-sm">{pendingWritesCount}</div>
              </div>
            </div>
          </div>

          <div className="p-2 overflow-y-auto space-y-1.5 max-h-80 divide-y divide-slate-800/40">
            {syncHealth.map((item) => (
              <div
                key={item.collectionName}
                className="pt-1.5 first:pt-0 flex flex-col gap-1 text-[11px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{item.collectionName}</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-slate-400 font-mono">({item.count})</span>
                    {item.fromCache ? (
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-semibold" title="Data served from local browser cache">
                        fromCache
                      </span>
                    ) : (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-semibold" title="Live data verified from Firestore server">
                        Server
                      </span>
                    )}
                    {item.hasPendingWrites ? (
                      <span className="bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded font-semibold" title="Uncommitted local writes pending">
                        pendingWrites
                      </span>
                    ) : (
                      <span className="bg-slate-900 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">
                        clean
                      </span>
                    )}
                  </div>
                </div>

                {item.error ? (
                  <div className="text-[10px] text-red-300 bg-red-950/60 p-1.5 rounded border border-red-800/80">
                    {item.error}
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>
                      {item.firestoreLastUpdated ? `Last: ${new Date(item.firestoreLastUpdated).toLocaleTimeString()}` : 'Not synced'}
                    </span>
                    <span className={item.fromCache ? 'text-amber-400 font-medium' : 'text-emerald-400'}>
                      {item.fromCache ? 'Blocked by Cache / Offline' : 'Live Sync OK'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp error");
  return context;
};
