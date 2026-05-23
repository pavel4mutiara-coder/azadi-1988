/**
 * Robust modular databaseService.ts
 * Self-managed live reactive database, decoupled from Firebase, storing collections in localStorage.
 */

import { INITIAL_COMMITTEE } from '../utils/committee';
import { 
  Donation, 
  Leadership, 
  Event, 
  Notice, 
  News, 
  OrganizationSettings, 
  LetterheadConfig 
} from '../types';

type CollectionType = 'donations' | 'leadership' | 'events' | 'notices' | 'news' | 'config' | 'diagnostics';

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
  flag: "https://lh3.googleusercontent.com/d/TWJkEOGDsfJ4uH7NKqcDMLYHiTGEGM4q",
  adminWhatsApp: "8801711975488",
  bkash: "01711975488",
  nagad: "01711975488",
  roket: "01711975488",
  facebook: "https://www.facebook.com/profile.php?id=61585193438030",
  youtube: "https://youtube.com/@azadisocialwelfareorganization?si=gD7Akj6EdMYjHuFe",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb7KLIx0AgW4u9K4aw1k"
};

const DEFAULT_LETTERHEAD: LetterheadConfig = {
  leaderName: "মোঃ আব্দুছ ছাবির (টুটুল)",
  designation: "সভাপতি",
  signature: "",
  stampText: "আজাদী সমাজ কল্যাণ সংঘ, সিলেট",
  bodyText: ""
};

class SimulatedDatabase {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private inMemoryStore: Map<string, string> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private safeGetItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        // Hydrate in-memory copy
        this.inMemoryStore.set(key, value);
        return value;
      }
    } catch (e) {
      console.warn(`[databaseService] localStorage read blocked for "${key}". Using active memory copy.`, e);
    }
    return this.inMemoryStore.get(key) || null;
  }

  private safeSetItem(key: string, value: string) {
    this.inMemoryStore.set(key, value);
    try {
      localStorage.setItem(key, value);
    } catch (e: any) {
      console.error(`[databaseService] localStorage write failed for "${key}". Resilient memory backup retained.`, e);
      // Quota limit hit: clear diagnostics to liberate memory
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.number === -2147024882) {
        this.healQuotaExceeded();
      }
    }
  }

  private safeRemoveItem(key: string) {
    this.inMemoryStore.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[databaseService] localStorage delete blocked for "${key}".`, e);
    }
  }

  private healQuotaExceeded() {
    try {
      console.warn('[databaseService] LocalStorage quota reached. Automatically purging non-critical telemetry...');
      this.safeSetItem('azadi_db_diagnostics', JSON.stringify([]));
    } catch (err) {
      console.error('[databaseService] Automated quota resolution failed:', err);
    }
  }

  public seedDefaults() {
    try {
      // 1. Seed settings
      const settingsRaw = this.safeGetItem('azadi_db_config_settings');
      let isSettingsValid = false;
      try {
        if (settingsRaw) {
          JSON.parse(settingsRaw);
          isSettingsValid = true;
        }
      } catch {
        isSettingsValid = false;
      }
      if (!isSettingsValid) {
        this.safeSetItem('azadi_db_config_settings', JSON.stringify(DEFAULT_SETTINGS));
      }

      // 2. Seed letterhead
      const letterheadRaw = this.safeGetItem('azadi_db_config_letterhead');
      let isLetterheadValid = false;
      try {
        if (letterheadRaw) {
          JSON.parse(letterheadRaw);
          isLetterheadValid = true;
        }
      } catch {
        isLetterheadValid = false;
      }
      if (!isLetterheadValid) {
        this.safeSetItem('azadi_db_config_letterhead', JSON.stringify(DEFAULT_LETTERHEAD));
      }

      // 3. Seed leadership
      const savedLeadership = this.safeGetItem('azadi_db_leadership');
      let isLeadershipValid = false;
      let leadershipLength = 0;
      try {
        if (savedLeadership) {
          const parsed = JSON.parse(savedLeadership);
          isLeadershipValid = Array.isArray(parsed);
          leadershipLength = parsed.length;
        }
      } catch {
        isLeadershipValid = false;
      }

      if (!isLeadershipValid || leadershipLength === 0) {
        const initialLeaders: Leadership[] = INITIAL_COMMITTEE.map((l, i) => ({
          id: `leader-${i + 1}`,
          nameEn: l.nameEn,
          nameBn: l.nameBn,
          designationEn: l.designationEn,
          designationBn: l.designationBn,
          subDesignationEn: l.subDesignationEn || "",
          subDesignationBn: l.subDesignationBn || "",
          messageEn: "",
          messageBn: "",
          phone: "",
          image: "",
          order: l.order,
          status: 'active',
          createdAt: new Date().toISOString()
        }));
        this.safeSetItem('azadi_db_leadership', JSON.stringify(initialLeaders));
      }

      // Ensure keys exist & are valid arrays
      const collections: CollectionType[] = ['donations', 'events', 'notices', 'news', 'diagnostics'];
      collections.forEach(coll => {
        const raw = this.safeGetItem(`azadi_db_${coll}`);
        let isValid = false;
        try {
          if (raw) {
            isValid = Array.isArray(JSON.parse(raw));
          }
        } catch {
          isValid = false;
        }
        if (!isValid) {
          this.safeSetItem(`azadi_db_${coll}`, JSON.stringify([]));
        }
      });
    } catch (e) {
      console.error('[databaseService] Default seeding failed:', e);
    }
  }

  public getCollection(collName: string): any[] {
    try {
      const key = collName.startsWith('config_') ? `azadi_db_${collName}` : 
                  collName === 'config' ? 'azadi_db_config_settings' : `azadi_db_${collName}`;
      const serialized = this.safeGetItem(key);
      if (serialized) {
        try {
          const parsed = JSON.parse(serialized);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          console.warn(`[databaseService] Corrupt JSON detected in key "${key}". Auto-remedying.`);
          // Auto-remedying the corruption
          if (collName === 'config_settings' || collName === 'settings' || key === 'azadi_db_config_settings') {
            this.safeSetItem(key, JSON.stringify(DEFAULT_SETTINGS));
            return [DEFAULT_SETTINGS];
          } else if (collName === 'config_letterhead' || collName === 'letterhead' || key === 'azadi_db_config_letterhead') {
            this.safeSetItem(key, JSON.stringify(DEFAULT_LETTERHEAD));
            return [DEFAULT_LETTERHEAD];
          } else if (collName === 'leadership') {
            this.safeRemoveItem('azadi_db_leadership');
            this.seedDefaults();
            const reseeded = this.safeGetItem('azadi_db_leadership');
            return reseeded ? JSON.parse(reseeded) : [];
          } else {
            this.safeSetItem(key, JSON.stringify([]));
            return [];
          }
        }
      }
      if (collName === 'config_settings' || collName === 'settings') return [DEFAULT_SETTINGS];
      if (collName === 'config_letterhead' || collName === 'letterhead') return [DEFAULT_LETTERHEAD];
      return [];
    } catch {
      return [];
    }
  }

  private saveCollectionData(collName: string, data: any[]) {
    this.safeSetItem(`azadi_db_${collName}`, JSON.stringify(data));
    this.notifyCollectionListeners(collName, data);
  }

  private notifyCollectionListeners(collName: string, data: any) {
    const collListeners = this.listeners.get(collName);
    if (collListeners) {
      collListeners.forEach(cb => cb(data));
    }
  }

  public subscribe(collName: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(collName)) {
      this.listeners.set(collName, new Set());
    }
    this.listeners.get(collName)!.add(callback);

    // Initial triggers
    if (collName === 'config_settings') {
      const raw = this.safeGetItem('azadi_db_config_settings');
      let parsed = DEFAULT_SETTINGS;
      try {
        if (raw) parsed = JSON.parse(raw);
      } catch {
        parsed = DEFAULT_SETTINGS;
      }
      callback(parsed);
    } else if (collName === 'config_letterhead') {
      const raw = this.safeGetItem('azadi_db_config_letterhead');
      let parsed = DEFAULT_LETTERHEAD;
      try {
        if (raw) parsed = JSON.parse(raw);
      } catch {
        parsed = DEFAULT_LETTERHEAD;
      }
      callback(parsed);
    } else {
      callback(this.getCollection(collName));
    }

    return () => {
      const set = this.listeners.get(collName);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(collName);
      }
    };
  }

  public async saveItem(collName: string, id: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[databaseService] saveItem -> Collection: ${collName}, ID: ${id}`);
      
      if (collName === 'config') {
        const itemKey = `azadi_db_config_${id}`;
        this.safeSetItem(itemKey, JSON.stringify(data));
        this.notifyCollectionListeners(`config_${id}`, data);
        return { success: true };
      }

      const items = this.getCollection(collName);
      const index = items.findIndex(item => item.id === id);
      const record = { ...data, id, updatedAt: Date.now() };

      if (index > -1) {
        items[index] = record;
      } else {
        items.push(record);
      }

      this.saveCollectionData(collName, items);
      return { success: true };
    } catch (e: any) {
      console.error(`[databaseService] saveItem failed for ${collName}/${id}:`, e);
      return { success: false, error: e.message };
    }
  }

  public async updateItem(collName: string, id: string, data: any): Promise<{ success: boolean; error?: string }> {
    return this.saveItem(collName, id, data);
  }

  public async deleteItem(collName: string, id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[databaseService] deleteItem -> Collection: ${collName}, ID: ${id}`);
      const items = this.getCollection(collName);
      const filtered = items.filter(item => item.id !== id);
      this.saveCollectionData(collName, filtered);
      return { success: true };
    } catch (e: any) {
      console.error(`[databaseService] deleteItem failed for ${collName}/${id}:`, e);
      return { success: false, error: e.message };
    }
  }
}

export const dbInstance = new SimulatedDatabase();

export const saveItem = async (collName: string, id: string, data: any) => {
  return dbInstance.saveItem(collName, id, data);
};

export const updateItem = async (collName: string, id: string, data: any) => {
  return dbInstance.updateItem(collName, id, data);
};

export const deleteItem = async (collName: string, id: string) => {
  return dbInstance.deleteItem(collName, id);
};

export const getCollection = (collName: string) => {
  return dbInstance.getCollection(collName);
};

export const subscribeCollection = (
  collName: string, 
  callback: (data: any[]) => void, 
  _onErrorCallback?: (error: any) => void
) => {
  return dbInstance.subscribe(collName, callback);
};

export const seedDefaults = () => {
  return dbInstance.seedDefaults();
};

export const saveSettingsCloud = async (settings: any) => {
  return dbInstance.saveItem('config', 'settings', settings);
};

export const saveLetterheadCloud = async (config: any) => {
  return dbInstance.saveItem('config', 'letterhead', config);
};

export const subscribeSettings = (callback: (data: any) => void) => {
  return dbInstance.subscribe('config_settings', callback);
};

export const subscribeLetterhead = (callback: (data: any) => void) => {
  return dbInstance.subscribe('config_letterhead', callback);
};

export const reEnableCloudNetwork = async () => {
  return true;
};

export const getLegacyData = async () => {
  return null;
};
