'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    // If already initialized, return the SDKs with the already initialized App
    return getSdks(getApp());
  }
  
  // When running in a production environment (deployed), Firebase App Hosting
  // provides environment variables that `initializeApp()` can use automatically.
  if (process.env.NODE_ENV === 'production') {
    try {
      const firebaseApp = initializeApp();
      return getSdks(firebaseApp);
    } catch (e) {
      console.error("Automatic Firebase initialization failed in production, falling back to config object.", e);
      // Fallback to config object if auto-init fails even in production
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);
    }
  } else {
    // In development, always initialize with the provided config object.
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
