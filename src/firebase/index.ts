
import { getApp, getApps, initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  enableNetwork,
  setLogLevel,
  Firestore,
  getDocFromServer
} from "firebase/firestore";
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebaseAppletConfig from "../../firebase-applet-config.json";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
    },
    operationType,
    path
  };
  const stringified = JSON.stringify(errInfo);
  console.error('Firestore Error: ', stringified);
  throw new Error(stringified);
}

// Primary configuration source with fallback to environment variables for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId
};

// Global exports with lazy initialization risk management
export let app: FirebaseApp;
export let db: Firestore;
export let auth: Auth;
export let storage: FirebaseStorage;

try {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    // Validate required config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("CRITICAL: Firebase configuration is missing. Ensure firebase-applet-config.json exists or environment variables are set.");
    }
    app = initializeApp(firebaseConfig);
  }
  
  // Use databaseId from config or env if available
  const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || (firebaseAppletConfig as any).firestoreDatabaseId || "(default)";
  db = getFirestore(app, databaseId);
  auth = getAuth(app);
  storage = getStorage(app);
  
  // Explicitly set persistence to LOCAL for stability on Android/PWA
  const initAuth = async () => {
    try {
      const { setPersistence, browserLocalPersistence } = await import("firebase/auth");
      await setPersistence(auth, browserLocalPersistence);
    } catch (err) {
      console.warn("Auth persistence failed:", err);
    }
  };
  initAuth();
  
  // Enable offline persistence for better Android/Mobile stability
  const initPersistence = async () => {
    try {
      const { enableIndexedDbPersistence } = await import("firebase/firestore");
      await enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("Firestore persistence failed: Multiple tabs open.");
        } else if (err.code === 'unimplemented') {
          console.warn("Firestore persistence is not supported by this browser.");
        }
      });
    } catch (err) {
      console.warn("Firestore persistence initialization failed:", err);
    }
  };
  initPersistence();
  
  setLogLevel('silent');

  // Connection Test as per instructions
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. Client is offline.");
      }
    }
  };
  testConnection();
} catch (error) {
  console.error("Firebase Initialization Failed:", error);
}

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

/**
 * Save an item to a specific collection
 */
export const saveItem = async (collName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collName, id);
    const finalData = { ...data, id, updatedAt: Date.now() };
    await setDoc(docRef, finalData, { merge: true });
    return { success: true };
  } catch (e: any) {
    handleFirestoreError(e, OperationType.WRITE, `${collName}/${id}`);
    return { success: false, error: e.message };
  }
};

/**
 * Delete an item from a collection
 */
export const deleteItem = async (collName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collName, id));
    return { success: true };
  } catch (e: any) {
    handleFirestoreError(e, OperationType.DELETE, `${collName}/${id}`);
    return { success: false, error: e.message };
  }
};

/**
 * Subscribe to a collection with real-time updates
 */
export const subscribeCollection = (collName: string, callback: (data: any[]) => void, onErrorCallback?: (error: any) => void) => {
  const q = query(collection(db, collName));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(items);
  }, (error: any) => {
    if (onErrorCallback) onErrorCallback(error);
    // Graceful handling of permission errors
    if (error.code === 'permission-denied') {
      console.warn(`Insufficient permissions for ${collName}. Please update Security Rules.`);
    } else {
      console.warn(`Listener error for ${collName}:`, error);
    }
  });
};

/**
 * Upload an image file to Firebase Storage
 */
export const uploadImage = async (file: File, folder: string = "uploads"): Promise<string> => {
  try {
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Storage Upload Failed:", error);
    throw error;
  }
};

/**
 * Image URL Repair Utility
 * Reconnects broken Google Storage/Firebase URLs if they points to wrong project
 */
export const repairImageUrl = (url: any): string => {
  if (!url || typeof url !== 'string') return "";
  if (url.includes("placeholder") || url.startsWith("data:")) return url;
  
  // Replace legacy/broken storage domains with active one
  let fixedUrl = url;
  if (url.includes("firebasestorage.googleapis.com")) {
    const bucket = `${FIREBASE_PROJECT_ID}.firebasestorage.app`; // or .appspot.com
    if (!url.includes(FIREBASE_PROJECT_ID) && url.includes("/b/")) {
      const parts = url.split("/b/");
      if (parts.length > 1) {
        const afterB = parts[1].split("/");
        afterB[0] = bucket;
        fixedUrl = parts[0] + "/b/" + afterB.join("/");
      }
    }
  }
  
  return fixedUrl;
};

/**
 * Legacy Data Recovery Helper
 * Fetches the old single-document state from various possible legacy locations
 */
export const getLegacyData = async () => {
  const legacyPaths = [
    doc(db, "config", "state"),
    doc(db, "settings", "global"),
    doc(db, "app", "data"),
    doc(db, "state", "backup"),
    doc(db, "azadi", "main"),
    doc(db, "azadi_society", "data"),
    doc(db, "unlimited", "sync"),
    doc(db, "permanent_storage", "app_state")
  ];
  
  for (const path of legacyPaths) {
    try {
      const snap = await getDoc(path);
      if (snap.exists()) {
        console.log("Legacy document found at:", path.path);
        const data = snap.data();
        // Recurse repair for images in the legacy data
        return JSON.parse(JSON.stringify(data), (key, value) => {
          if (typeof value === 'string' && (value.includes("http") || value.includes("firebasestorage"))) {
            return repairImageUrl(value);
          }
          return value;
        });
      }
    } catch (e) {
      // Ignore errors on individual path checks
    }
  }
  return null;
};

export const saveSettingsCloud = async (settings: any) => saveItem("config", "settings", settings);
export const saveLetterheadCloud = async (config: any) => saveItem("config", "letterhead", config);

export const subscribeSettings = (callback: (data: any) => void) => {
  const path = "config/settings";
  return onSnapshot(doc(db, "config", "settings"), (doc) => {
    callback(doc.exists() ? doc.data() : null);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
    callback(null);
  });
};

export const subscribeLetterhead = (callback: (data: any) => void) => {
  const path = "config/letterhead";
  return onSnapshot(doc(db, "config", "letterhead"), (doc) => {
    callback(doc.exists() ? doc.data() : null);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
    callback(null);
  });
};

export const reEnableCloudNetwork = async () => {
  try {
    await enableNetwork(db);
    return true;
  } catch (e) {
    return false;
  }
};
