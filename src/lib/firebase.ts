// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// Se estiver em ambiente de desenvolvimento, conecte ao emulador de autenticação
if (process.env.NODE_ENV === 'development') {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
}


export { db, auth, app };
