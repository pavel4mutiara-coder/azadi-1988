/**
 * Unified Production Backend Configuration
 * Connecting components to active remote Firestore, Authentication, and Storage.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, collection, onSnapshot, getDocFromServer, enableNetwork } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase SDK Instances
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: Database name matching configured custom database */
export const auth = getAuth(app);
export const storage = getStorage(app);

// Test Remote Database connection on boot sequence (Phase 0 Check)
(async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase connectivity or offline variables.");
    }
  }
})();

// Operation Types for diagnostic analytics
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Global Exception capture hook conforming strictly to database constraints
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Custom DB writes
export const saveItem = async (collName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collName, id);
    await setDoc(docRef, { ...data, updatedAt: Date.now() });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collName}/${id}`);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

export const deleteItem = async (collName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collName, id));
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collName}/${id}`);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Collection Realtime synchronization query
export const subscribeCollection = (
  collName: string, 
  callback: (data: any[]) => void, 
  onErrorCallback?: (error: any) => void
) => {
  const q = collection(db, collName);
  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(list);
  }, (error) => {
    if (onErrorCallback) onErrorCallback(error);
    handleFirestoreError(error, OperationType.GET, collName);
  });
};

// Config Settings real-time subscribers
export const subscribeSettings = (callback: (data: any) => void) => {
  return onSnapshot(doc(db, 'config', 'settings'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'config/settings');
  });
};

export const subscribeLetterhead = (callback: (data: any) => void) => {
  return onSnapshot(doc(db, 'config', 'letterhead'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'config/letterhead');
  });
};

// Configuration save handlers
export const saveSettingsCloud = async (settings: any) => {
  return saveItem('config', 'settings', settings);
};

export const saveLetterheadCloud = async (config: any) => {
  return saveItem('config', 'letterhead', config);
};

// Network controller
export const reEnableCloudNetwork = async () => {
  try {
    await enableNetwork(db);
    return true;
  } catch {
    return false;
  }
};

// Placeholder legacy API
export const getLegacyData = async () => {
  return null;
};

// Asset image formatting helpers
export const repairImageUrl = (url: any): string => {
  if (!url || typeof url !== 'string') return "";
  return url;
};

// Asset deletions
export const deleteStorageObject = async (url: string) => {
  try {
    if (!url || !url.includes('firebasestorage.googleapis.com')) {
      return { success: true };
    }
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    console.error("Storage delete error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Authorization Re-exports
export { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  signInWithEmailAndPassword
};

export type User = any;
