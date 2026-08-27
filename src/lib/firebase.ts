import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigFile from '../../firebase-applet-config.json';

// Unified Firebase Configuration from VITE_ environment variables or firebase-applet-config.json fallback
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey || 'AIzaSyCHEV4hOMBO7t-P4kvAUpN0oJiaCaO7Ths',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain || 'azadi-social-welfare.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId || 'azadi-social-welfare',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket || 'azadi-social-welfare.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId || '265728132052',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId || '1:265728132052:web:155282236253af245b8c41',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigFile.measurementId || 'G-YH14D125WS'
};

// Safe development diagnostic: logs only non-sensitive environment metadata
if (typeof window !== 'undefined') {
  console.log('[Firebase Init Diagnostic]', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucketConfigured: Boolean(firebaseConfig.storageBucket)
  });
}

// Single clean Firebase initialization using provisioned config
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore database instance targeting the default database of the new project
export const db = getFirestore(app);

// Auth instance
export const auth = getAuth(app);

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code || 'unknown';

  if (
    errMsg.includes('Firestore shutting down') || 
    errMsg.includes('Could not reach Cloud Firestore backend') ||
    errMsg.includes('Missing or insufficient permissions') ||
    errMsg.includes('permission-denied') ||
    code === 'permission-denied' ||
    code === 'cancelled' || 
    code === 'aborted' ||
    code === 'unavailable'
  ) {
    // Ignore / warn for benign teardown, shutdown, or missing remote permissions
    console.warn(`[Firestore Access Notice] [Op: ${operationType}] [Path: ${path}] [Code: ${code}]`, errMsg);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
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

  console.warn('[Firestore Operation Notice]', errInfo);
}

/**
 * Formats raw Firebase and network errors into clear, accurate, user-friendly messages.
 * Never genericizes permission or data errors as "client is offline".
 */
export function formatFirebaseError(error: unknown, lang: 'en' | 'bn' = 'en'): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return lang === 'bn' 
      ? 'আপনি বর্তমানে অফলাইনে আছেন। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।'
      : 'You are currently offline. Please reconnect to the internet and try again.';
  }

  if (error instanceof Error) {
    if (error.message === 'MISSING_ADMIN_DOC') {
      return lang === 'bn'
        ? 'আপনার Firebase Admin authorization document পাওয়া যায়নি।'
        : 'Your Firebase Admin authorization document was not found in Firestore (/admins/{uid}).';
    }
    if (error.message === 'INACTIVE_ADMIN') {
      return lang === 'bn'
        ? 'আপনার অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে।'
        : 'Your administrator account is marked as inactive.';
    }
    if (error.message === 'UNAUTHORIZED_ROLE') {
      return lang === 'bn'
        ? 'এই কাজটি করার জন্য আপনার প্রশাসনিক ভূমিকা (Role) অনুমোদিত নয়।'
        : 'Your administrator role does not have permission for this action.';
    }
    if (error.message === 'unauthenticated' || error.message === 'UNAUTHENTICATED') {
      return lang === 'bn'
        ? 'আপনি লগইন করেননি।'
        : 'You are not logged in. Please sign in as an administrator.';
    }
    if (error.message === 'EDIT_CONFLICT' || error.message === 'DOCUMENT_NOT_FOUND') {
      return error.message;
    }
  }

  const errObj = error as any;
  const code = (errObj?.code || '').toLowerCase();
  const rawMsg = errObj?.message || String(error || '');

  console.warn('[Firebase Detailed Diagnostic]', {
    code,
    rawMsg,
    fullError: error,
    authUid: auth.currentUser?.uid,
    authEmail: auth.currentUser?.email,
    onLine: typeof navigator !== 'undefined' ? navigator.onLine : true
  });

  if (code.includes('permission-denied') || rawMsg.includes('permission-denied') || rawMsg.includes('Missing or insufficient permissions')) {
    return lang === 'bn'
      ? 'Firestore permission denied. আপনার Admin authorization যাচাই করুন।'
      : 'Firestore permission denied. Please verify your Admin authorization in /admins/{uid}.';
  }

  if (code.includes('unauthenticated') || rawMsg.includes('unauthenticated')) {
    return lang === 'bn'
      ? 'আপনি লগইন করেননি।'
      : 'You are not logged in.';
  }

  if (code.includes('failed-precondition')) {
    return lang === 'bn'
      ? `ফায়ারস্টোর পূর্বশর্ত ব্যর্থ (failed-precondition): ${rawMsg}`
      : `Firestore failed-precondition: ${rawMsg}`;
  }

  if (code.includes('unavailable') || rawMsg.includes('unavailable')) {
    return lang === 'bn'
      ? 'ফায়ারস্টোর সার্ভিস সাময়িকভাবে অফলাইন বা অনুপলব্ধ। ইন্টারনেট সংযোগ পরীক্ষা করুন।'
      : 'Firestore service is temporarily offline or unavailable. Please check your network connection.';
  }

  if (code.includes('not-found') || rawMsg.includes('not-found')) {
    return lang === 'bn'
      ? 'কাঙ্ক্ষিত তথ্যটি ফায়ারস্টোর ডেটাবেজে পাওয়া যায়নি।'
      : 'The requested document was not found on the server.';
  }

  if (code.includes('already-exists')) {
    return lang === 'bn'
      ? 'এই আইডির একটি তথ্য ইতিমধ্যে ফায়ারস্টোরে বিদ্যমান।'
      : 'A document with this ID already exists in Firestore.';
  }

  if (code.includes('invalid-argument')) {
    return lang === 'bn'
      ? 'অকার্যকর তথ্য ফরম্যাট প্রদান করা হয়েছে।'
      : 'Invalid data format submitted to Firestore.';
  }

  if (code.includes('resource-exhausted')) {
    return lang === 'bn'
      ? 'ফায়ারস্টোর সার্ভিস কোটা বা রিকোয়েস্ট লিমিট পূর্ণ হয়েছে।'
      : 'Firestore resource quota or rate limit exceeded.';
  }

  if (code.startsWith('storage/')) {
    if (code === 'storage/unauthorized') {
      return lang === 'bn'
        ? 'স্টোরেজ অনুমতি অস্বীকার করা হয়েছে: ফাইল আপলোড করার অধিকার নেই।'
        : 'Storage permission denied: You do not have permission to upload files.';
    }
    if (code === 'storage/canceled') {
      return lang === 'bn' ? 'ফাইল আপলোড বাতিল করা হয়েছে।' : 'Upload was canceled.';
    }
    return lang === 'bn'
      ? `ফাইল আপলোডের সময় স্টোরেজ ত্রুটি ঘটেছে: ${rawMsg}`
      : `Storage upload error: ${rawMsg}`;
  }

  // Fallback to raw message if it's readable and not raw JSON
  if (rawMsg && !rawMsg.trim().startsWith('{')) {
    return rawMsg;
  }

  return lang === 'bn' 
    ? 'অপারেশন সম্পন্ন করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
    : 'Failed to complete operation. Please try again.';
}
