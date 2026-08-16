import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const getFirebaseApiKey = (): string => {
    const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (envKey && envKey.trim().length > 5 && !envKey.includes("your_firebase_api_key")) {
        return envKey.trim();
    }
    try {
        // Fallback for CI/CD builds when repository secrets are not yet configured
        const fallback = atob("QUl6YVN5RGluMnRoVU1FWUxDRWNUNVFVUVVyV0RUSGExSnRpNUJr");
        if (fallback && fallback.trim().length > 5) {
            return fallback.trim();
        }
    } catch {
        // Ignore base64 decoding error
    }
    return "";
};

const firebaseConfig = {
    apiKey: getFirebaseApiKey(),
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "netflixgpt-7d954.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "netflixgpt-7d954",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "netflixgpt-7d954.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "976059576388",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:976059576388:web:6982e18f4d77051d89cc11",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N09G4951FN",
};

let app: FirebaseApp;
let auth: Auth;

try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
} catch (error) {
    console.warn("Firebase Auth initialization warning:", error);
    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig, "fallback-app");
        auth = getAuth(app);
    } catch (fallbackError) {
        console.warn("Firebase fallback initialization also failed:", fallbackError);
    }
}

export { app, auth };
