
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
  onSnapshot,
  setLogLevel
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Database Engineer Note: ACTIVE PROJECT IS azadi-93ad1
export const FIREBASE_PROJECT_ID = "azadi-93ad1";

// Silence internal SDK logs to prevent console clutter
setLogLevel('silent');

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
export const saveToCloud = async (data: any, isRetry = false): Promise<{success: boolean, error?: string, type?: 'auth' | 'not-found' | 'api-disabled' | 'billing-required'}> => {
  try {
    const docRef = doc(db, "azadi_organization", "state_v2");
    await setDoc(docRef, data);
    // Success! Clear all error flags
    localStorage.removeItem('azadi_cloud_disabled');
    localStorage.removeItem('azadi_db_missing');
    localStorage.removeItem('azadi_billing_required');
    return { success: true };
  } catch (e: any) {
    const errorMsg = e.message?.toLowerCase() || '';
    const errorCode = e.code || '';
    
    if (errorMsg.includes('billing') || errorMsg.includes('billing-enabled') || errorMsg.includes('requires billing')) {
      localStorage.setItem('azadi_billing_required', 'true');
      return { 
        success: false, 
        error: "Google Cloud Billing must be enabled for project " + FIREBASE_PROJECT_ID, 
        type: 'billing-required' 
      };
    }

    if (errorMsg.includes('not exist') || errorMsg.includes('not-found') || errorCode === 'not-found') {
      localStorage.setItem('azadi_db_missing', 'true');
      return { 
        success: false, 
        error: "Firestore database instance (default) is missing. Please create it in the Firebase console.", 
        type: 'not-found' 
      };
    }
    
    if (errorMsg.includes('not been used') || errorMsg.includes('api has not been used') || errorMsg.includes('disabled') || (errorCode === 'permission-denied' && errorMsg.includes('api'))) {
      if (!isRetry) {
        localStorage.setItem('azadi_cloud_disabled', 'true');
        disableNetwork(db).catch(() => {});
      }
      return { success: false, error: "Cloud Firestore API is not enabled in Google Cloud Console.", type: 'api-disabled' };
    }

    if (errorCode === 'permission-denied') {
      return { success: false, error: "Permission Denied. Check your Firestore Security Rules.", type: 'auth' };
    }
    
    if (errorCode === 'unavailable') {
        return { success: false, error: "Cloud service is currently unavailable. Working in offline mode." };
    }

    return { success: false, error: e.message };
  }
};

/**
 * Loads data from Cloud.
 */
export const loadFromCloud = async (): Promise<{data: any | null, error?: string, type?: 'auth' | 'not-found' | 'api-disabled' | 'billing-required'}> => {
  try {
    const docRef = doc(db, "azadi_organization", "state_v2");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      localStorage.removeItem('azadi_cloud_disabled');
      localStorage.removeItem('azadi_db_missing');
      localStorage.removeItem('azadi_billing_required');
      return { data: docSnap.data() };
    }
    return { data: null };
  } catch (e: any) {
    const errorMsg = e.message?.toLowerCase() || '';
    const errorCode = e.code || '';
    
    if (errorMsg.includes('billing') || errorMsg.includes('billing-enabled') || errorMsg.includes('requires billing')) {
        localStorage.setItem('azadi_billing_required', 'true');
        return { data: null, type: 'billing-required' };
    }

    if (errorMsg.includes('not-found') || errorMsg.includes('not exist') || errorCode === 'not-found') {
        localStorage.setItem('azadi_db_missing', 'true');
        return { data: null, type: 'not-found' };
    }
    
    if (errorMsg.includes('disabled') || errorMsg.includes('not been used') || (errorCode === 'permission-denied' && errorMsg.includes('api'))) {
        localStorage.setItem('azadi_cloud_disabled', 'true');
        return { data: null, type: 'api-disabled' };
    }
        
    return { data: null, error: e.message as any };
  }
};

/**
 * Helper to subscribe to real-time updates for the main state document
 */
export const subscribeToCloudState = (callback: (data: any) => void) => {
  const docRef = doc(db, "azadi_organization", "state_v2");
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  }, (error) => {
    console.warn("Real-time cloud listener error:", error);
  });
};

/**
 * Re-connects the database network
 */
export const reEnableCloudNetwork = async () => {
  localStorage.removeItem('azadi_cloud_disabled');
  localStorage.removeItem('azadi_db_missing');
  localStorage.removeItem('azadi_billing_required');
  try {
    await enableNetwork(db);
    return true;
  } catch (e) {
    console.error("Enable Network Failed:", e);
    return false;
  }
}
