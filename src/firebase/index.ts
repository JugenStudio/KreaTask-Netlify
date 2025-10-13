'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This is the primary configuration object for Firebase services.
// It pulls values from environment variables, which is the recommended approach.
const firebaseConfig = {
  apiKey: "AlzaSyCcjQwBlkcJjkusHY9knsASOYaOuzrbeFo",
  authDomain: "kreatask-backup-56531938-324cb.firebaseapp.com",
  projectId: "kreatask-backup-56531938-324cb",
  storageBucket: "kreatask-backup-56531938-324cb.appspot.com",
  messagingSenderId: "615077435379",
  appId: "1:615077435379:web:e4283cf3d19117a695a486",
};

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      // ✅ Selalu pakai config agar tetap jalan di Netlify, Capacitor, dll.
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Firebase init failed:', e);
      // In a real-world scenario, you might want to throw the error
      // or handle it in a way that informs the user the app cannot connect.
      // For this context, we'll let it fail and the hooks will handle the null services.
      // This is primarily to avoid a hard crash during development if config is wrong.
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp!); // Use non-null assertion as getApp() should return an app if apps exist.
}

export function getSdks(firebaseApp: FirebaseApp) {
  if (!firebaseApp) {
    // This case should ideally not be hit if initialization logic is correct,
    // but as a safeguard, we return null services.
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }
  const firestore = getFirestore(firebaseApp);
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore,
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
