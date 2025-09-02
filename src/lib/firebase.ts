'use client';
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'otimizador-de-runas',
  appId: '1:870600968343:web:cb32019e2a21ee41c441d2',
  storageBucket: 'otimizador-de-runas.firebasestorage.app',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'otimizador-de-runas.firebaseapp.com',
  messagingSenderId: '870600968343',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
    // This check ensures we're in a browser environment before connecting to the emulator.
    if (typeof window !== 'undefined') {
        // We check if the emulator is already connected to prevent errors from reconnecting.
        if (!auth.emulatorConfig) {
            try {
                connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
                console.log("Firebase Auth Emulator connected.");
            } catch (error) {
                console.error("Error connecting to Firebase Auth Emulator:", error);
            }
        }
    }
}


export { db, auth, app };
