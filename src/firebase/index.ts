'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
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
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object.',
          e
        );
      }
      // When running locally, initialize with the config object from environment variables
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  // Future: connect to emulators here if needed
  // if (process.env.NODE_ENV === 'development') {
  //   connectFirestoreEmulator(firestore, 'localhost', 8080);
  // }
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore,
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
