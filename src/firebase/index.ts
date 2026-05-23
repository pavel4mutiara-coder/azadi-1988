/**
 * Unified Backend Bridge Configuration
 * Bridge file connecting existing components to modular Mock Services.
 * Completely free of Firebase SDK dependencies.
 */

import { authInstance, MockUser } from '../services/authService';
import { dbInstance } from '../services/databaseService';
import { storageInstance } from '../services/storage/storageService';

// Decoupled mock exports matching previous structure for visual & routing compatibility
export const app = {
  options: {
    projectId: 'azadi-mock-project-id'
  }
};

export const db = dbInstance;
export const auth = authInstance;
export const storage = storageInstance;

export const FIREBASE_PROJECT_ID = 'azadi-mock-project-id';

// Database Services
export { 
  saveItem,
  deleteItem,
  subscribeCollection,
  saveSettingsCloud,
  saveLetterheadCloud,
  subscribeSettings,
  subscribeLetterhead,
  reEnableCloudNetwork,
  getLegacyData
} from '../services/databaseService';

// Storage Services
export {
  repairImageUrl,
  deleteStorageObject
} from '../services/storage/storageService';

// Auth Services
export {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from '../services/authService';
export type { MockUser as User };
