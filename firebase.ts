
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  disableNetwork,
  enableNetwork,
  onSnapshotsInSync
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Database Engineer Note: ACTIVE PROJECT IS azadi-93ad1
export const FIREBASE_PROJECT_ID = "azadi-93ad1";

const firebaseConfig = {
  apiKey: "AIzaSyAoliEs1RFNRO_aKhUN5LycqmjuWFDXiGw",
  authDomain: `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: `${FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "957941587028",
  appId: "1:957941587028:web:8125c3c5f7106efe0aa1c1",
  measurementId: "G-X6079WQEKQ"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust local persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

/**
 * Enhanced Save function with detailed error reporting
 */
export const saveToCloud = async (data: any, isRetry = false): Promise<{success: boolean, error?: string, type?: 'auth' | 'not-found' | 'api-disabled'}> => {
  try {
    const docRef = doc(db, "azadi_organization", "state_v2");
    await setDoc(docRef, data);
    localStorage.removeItem('azadi_cloud_disabled');
    return { success: true };
  } catch (e: any) {
    const errorMsg = e.message?.toLowerCase() || '';
    console.error("Cloud Error Code:", e.code);
    console.error("Cloud Error Message:", errorMsg);
    
    if (errorMsg.includes('not exist') || errorMsg.includes('not-found')) {
      return { success: false, error: "Database instance missing. Visit Firebase Console and 'Create Database'.", type: 'not-found' };
    }
    
    // Catch API disabled specifically
    if (errorMsg.includes('not been used') || errorMsg.includes('api has not been used') || errorMsg.includes('disabled')) {
      if (!isRetry) {
        localStorage.setItem('azadi_cloud_disabled', 'true');
        disableNetwork(db).catch(() => {});
      }
      return { success: false, error: "Cloud Firestore API is not enabled in Google Cloud Console.", type: 'api-disabled' };
    }

    if (e.code === 'permission-denied') {
      return { success: false, error: "Permission Denied. Check your Firestore Security Rules.", type: 'auth' };
    }
    
    return { success: false, error: e.message };
  }
};

/**
 * Loads data from Cloud.
 */
export const loadFromCloud = async (): Promise<{data: any | null, error?: string, type?: string}> => {
  try {
    const docRef = doc(db, "azadi_organization", "state_v2");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      localStorage.removeItem('azadi_cloud_disabled');
      return { data: docSnap.data() };
    }
    return { data: null };
  } catch (e: any) {
    const errorMsg = e.message?.toLowerCase() || '';
    if (errorMsg.includes('not-found') || errorMsg.includes('not exist')) return { data: null, type: 'not-found' };
    if (errorMsg.includes('disabled') || errorMsg.includes('not been used')) return { data: null, type: 'api-disabled' };
    return { data: null, error: e.message };
  }
};

/**
 * Re-connects the database network
 */
export const reEnableCloudNetwork = async () => {
  localStorage.removeItem('azadi_cloud_disabled');
  try {
    await enableNetwork(db);
    return true;
  } catch (e) {
    console.error("Enable Network Failed:", e);
    return false;
  }
};
