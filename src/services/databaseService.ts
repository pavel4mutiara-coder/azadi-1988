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

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    try {
      // 1. Seed settings
      if (!localStorage.getItem('azadi_db_config_settings')) {
        localStorage.setItem('azadi_db_config_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
      // 2. Seed letterhead
      if (!localStorage.getItem('azadi_db_config_letterhead')) {
        localStorage.setItem('azadi_db_config_letterhead', JSON.stringify(DEFAULT_LETTERHEAD));
      }
      // 3. Seed leadership
      const savedLeadership = localStorage.getItem('azadi_db_leadership');
      if (!savedLeadership || JSON.parse(savedLeadership).length === 0) {
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
        localStorage.setItem('azadi_db_leadership', JSON.stringify(initialLeaders));
      }

      // Ensure keys exist
      const collections: CollectionType[] = ['donations', 'events', 'notices', 'news', 'diagnostics'];
      collections.forEach(coll => {
        if (!localStorage.getItem(`azadi_db_${coll}`)) {
          localStorage.setItem(`azadi_db_${coll}`, JSON.stringify([]));
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
      const serialized = localStorage.getItem(key);
      if (serialized) {
        return JSON.parse(serialized);
      }
      if (collName === 'config_settings' || collName === 'settings') return [DEFAULT_SETTINGS];
      if (collName === 'config_letterhead' || collName === 'letterhead') return [DEFAULT_LETTERHEAD];
      return [];
    } catch {
      return [];
    }
  }

  private saveCollectionData(collName: string, data: any[]) {
    localStorage.setItem(`azadi_db_${collName}`, JSON.stringify(data));
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
      const raw = localStorage.getItem('azadi_db_config_settings');
      callback(raw ? JSON.parse(raw) : DEFAULT_SETTINGS);
    } else if (collName === 'config_letterhead') {
      const raw = localStorage.getItem('azadi_db_config_letterhead');
      callback(raw ? JSON.parse(raw) : DEFAULT_LETTERHEAD);
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
        localStorage.setItem(itemKey, JSON.stringify(data));
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
