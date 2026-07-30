import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigFile from '../../firebase-applet-config.json';

// Single clean Firebase initialization using provisioned config
export const app = getApps().length === 0 ? initializeApp(firebaseConfigFile) : getApp();

// Database instance targeting provisioned database ID
export const db = getFirestore(app, firebaseConfigFile.firestoreDatabaseId);

// Auth instance
export const auth = getAuth(app);

// Storage instance
export const storage = getStorage(app);

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
    code === 'cancelled' || 
    code === 'aborted' ||
    code === 'unavailable'
  ) {
    // Ignore benign teardown / shutdown / transient offline reconnect notices
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

  console.error(`[Firestore Technical Log] [Op: ${operationType}] [Path: ${path}] [Code: ${code}]`, JSON.stringify(errInfo));
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

  if (error instanceof Error && (error.message === 'EDIT_CONFLICT' || error.message === 'DOCUMENT_NOT_FOUND')) {
    return error.message;
  }

  const errObj = error as any;
  const code = (errObj?.code || '').toLowerCase();
  const rawMsg = errObj?.message || String(error || '');

  console.error('[Firebase Detailed Diagnostic]', {
    code,
    rawMsg,
    fullError: error,
    authUid: auth.currentUser?.uid,
    authEmail: auth.currentUser?.email,
    onLine: typeof navigator !== 'undefined' ? navigator.onLine : true
  });

  if (code.includes('permission-denied') || rawMsg.includes('permission-denied') || rawMsg.includes('Missing or insufficient permissions')) {
    return lang === 'bn'
      ? 'অনুমতি অস্বীকার করা হয়েছে: এই কাজটি করার জন্য আপনার প্রশাসনিক অধিকার (Admin Role) প্রয়োজন।'
      : 'Permission denied: You do not have administrative authorization to modify this document.';
  }

  if (code.includes('unauthenticated') || rawMsg.includes('unauthenticated')) {
    return lang === 'bn'
      ? 'প্রমাণীকরণ আবশ্যক: অনুগ্রহ করে পুনরায় অ্যাডমিন হিসেবে সাইন ইন করুন।'
      : 'Authentication required: Please sign in as an administrator again.';
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
