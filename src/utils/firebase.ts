import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "netflixgpt-7d954.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "netflixgpt-7d954",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "netflixgpt-7d954.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "976059576388",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:976059576388:web:6982e18f4d77051d89cc11",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N09G4951FN",
};

let app;
let auth: Auth;

try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
} catch (error) {
    console.warn("Firebase initialization error, using fallback instance:", error);
    app = initializeApp(firebaseConfig, "fallback");
    auth = getAuth(app);
}

export { app, auth };
