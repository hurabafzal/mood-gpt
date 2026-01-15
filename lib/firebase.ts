'client';
// lib/firebase.ts
import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";

// Initialize variables to hold Firebase services
let firebaseApp: FirebaseApp | undefined = undefined;
let db: Firestore | undefined = undefined;
let auth: Auth | undefined = undefined;

// Promise to track initialization state
let initializationPromise: Promise<void> | null = null;

// Flag to track initialization attempts
let initializationAttempted = false;

// Function to initialize Firebase
async function initializeFirebase() {
  // Only initialize once and only in browser environment
  if (initializationAttempted || typeof window === "undefined") {
    return;
  }
  

  initializationAttempted = true;

  try {
    // Dynamically import Firebase modules
    const { initializeApp, getApps, getApp } = await import("firebase/app");

    // Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    

    // Initialize Firebase app
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    

    // Initialize Firestore
    try {
      const { getFirestore } = await import("firebase/firestore");
      db = getFirestore(firebaseApp);
      
    } catch (firestoreError) {
      console.error("Firestore initialization error:", firestoreError);
    }

    // Initialize Auth
    try {
      const { getAuth } = await import("firebase/auth");
      auth = getAuth(firebaseApp);
      

      // Connect to emulators in development if enabled
      if (
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true"
      ) {
        const { connectAuthEmulator } = await import("firebase/auth");
        const { connectFirestoreEmulator } = await import("firebase/firestore");

        if (auth && db) {
          connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
          connectFirestoreEmulator(db, "localhost", 8080);
          
        }
      }
    } catch (authError) {
      console.error("Auth initialization error:", authError);
    }

    
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Safe getter functions to use throughout the app
export async function getFirebaseApp(): Promise<FirebaseApp | undefined> {
  if (!firebaseApp && !initializationAttempted) {
    initializationPromise = initializationPromise || initializeFirebase();
    await initializationPromise;
  }
  return firebaseApp;
}

export async function getFirestoreDb(): Promise<Firestore | undefined> {
  if (!db && !initializationAttempted) {
    initializationPromise = initializationPromise || initializeFirebase();
    await initializationPromise;
  }
  return db;
}

export async function getFirebaseAuth(): Promise<Auth | undefined> {
  if (!auth && !initializationAttempted) {
    initializationPromise = initializationPromise || initializeFirebase();
    await initializationPromise;
  }
  return auth;
}

// Export the instances for direct use (may be undefined initially)
export { firebaseApp, firebaseApp as app, db, auth };

// Initialize Firebase immediately in browser environment
if (typeof window !== "undefined") {
  initializationPromise = initializeFirebase();
  initializationPromise.catch(console.error);
}