
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

const firebaseConfig = {
  apiKey: "AIzaSyDxw9RA6f6vHJSEGtkQr6I9rLcrmaWNpDI",
  authDomain: "hussain-5124c.firebaseapp.com",
  projectId: "hussain-5124c",
  storageBucket: "hussain-5124c.firebasestorage.app",
  messagingSenderId: "926810630370",
  appId: "1:926810630370:web:3ff9b561ef4c728dac56bb",
  measurementId: "G-YR2E5VH6WH"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with high-performance persistent cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Listener to check sync status
onSnapshotsInSync(db, () => {
  console.log("Database Sync: Everything is up to date.");
});

/**
 * Robust Save function that detects API status
 */
export const saveToCloud = async (data: any): Promise<{success: boolean, apiDisabled?: boolean}> => {
  try {
    const docRef = doc(db, "azadi_organization", "state_v2");
    await setDoc(docRef, data);
    localStorage.removeItem('azadi_cloud_disabled');
    return { success: true };
  } catch (e: any) {
    console.error("Cloud Save Error:", e.code);
    if (e.code === 'permission-denied' || e.message?.toLowerCase().includes('disabled')) {
      localStorage.setItem('azadi_cloud_disabled', 'true');
      return { success: false, apiDisabled: true };
    }
    return { success: false };
  }
};

/**
 * Direct Load function
 */
export const loadFromCloud = async (): Promise<{data: any | null, apiDisabled?: boolean}> => {
  try {
    const docRef = doc(db, "azadi_organization", "state_v2");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      localStorage.removeItem('azadi_cloud_disabled');
      return { data: docSnap.data(), apiDisabled: false };
    }
    return { data: null, apiDisabled: false };
  } catch (e: any) {
    if (e.code === 'permission-denied' || e.message?.toLowerCase().includes('disabled')) {
      localStorage.setItem('azadi_cloud_disabled', 'true');
      return { data: null, apiDisabled: true };
    }
    return { data: null, apiDisabled: false };
  }
};

/**
 * Explicitly try to reconnect the network
 */
export const reEnableCloudNetwork = async () => {
  localStorage.removeItem('azadi_cloud_disabled');
  try {
    await enableNetwork(db);
    return true;
  } catch (e) {
    return false;
  }
};
