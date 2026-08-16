import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword as fbSignIn,
    createUserWithEmailAndPassword as fbCreateUser,
    signOut as fbSignOut,
    onAuthStateChanged as fbOnAuthStateChanged,
    updateProfile as fbUpdateProfile,
    sendPasswordResetEmail as fbSendPasswordResetEmail,
    confirmPasswordReset as fbConfirmPasswordReset,
    verifyPasswordResetCode as fbVerifyPasswordResetCode,
    setPersistence,
    browserLocalPersistence,
    Auth,
    User as FirebaseUser,
    UserCredential,
} from "firebase/auth";
import {
    getFirestore,
    Firestore,
} from "firebase/firestore";

const cleanConfigValue = (val: unknown): string => {
    if (typeof val !== "string") return "";
    return val.trim().replace(/[\r\n]/g, "");
};

// Read Firebase configuration from Vite environment variables
const firebaseConfig = {
    apiKey: cleanConfigValue(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanConfigValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: cleanConfigValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanConfigValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanConfigValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanConfigValue(import.meta.env.VITE_FIREBASE_APP_ID),
};

export const hasFirebaseConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "your_firebase_api_key_here" &&
    firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (hasFirebaseConfig) {
    try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        setPersistence(auth, browserLocalPersistence).catch(() => {});
    } catch (error) {
        console.warn("Firebase initialization error, using local fallback mode:", error);
    }
}

// Resilient Fallback Storage for Demo / Offline environments
const AUTH_STORAGE_KEY = "netflix_gpt_current_user";
const USERS_STORAGE_KEY = "netflix_gpt_registered_users";
const RESET_CODES_STORAGE_KEY = "netflix_gpt_reset_codes";

export interface MockUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified?: boolean;
    getIdToken?: () => Promise<string>;
}

type AuthListener = (user: FirebaseUser | MockUser | null) => void;
const listeners: Set<AuthListener> = new Set();

const notifyListeners = (user: FirebaseUser | MockUser | null) => {
    listeners.forEach((listener) => {
        try {
            listener(user);
        } catch (e) {
            console.error("Auth listener error:", e);
        }
    });
};

const getLocalStoredUser = (): MockUser | null => {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        return {
            ...parsed,
            getIdToken: async () => `demo_jwt_token_${parsed.uid}_${Date.now()}`,
        };
    } catch {
        return null;
    }
};

/**
 * Sign In with Email and Password
 */
export const signInWithEmailAndPassword = async (
    authInstance: Auth | null,
    email: string,
    password: string
): Promise<UserCredential | { user: MockUser }> => {
    if (auth && authInstance) {
        return await fbSignIn(authInstance, email, password);
    }

    // Resilient Local fallback
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (!email || !password) {
        const err: any = new Error("Email and password are required");
        err.code = "auth/invalid-credential";
        throw err;
    }

    const emailKey = email.toLowerCase().trim();
    let users: Record<string, { password: string; user: MockUser }> = {};
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) users = JSON.parse(stored);
    } catch {
        users = {};
    }

    const existing = users[emailKey];
    if (existing) {
        if (existing.password !== password) {
            const err: any = new Error("Invalid password credentials.");
            err.code = "auth/wrong-password";
            throw err;
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existing.user));
        notifyListeners(existing.user);
        return {
            user: {
                ...existing.user,
                getIdToken: async () => `jwt_token_${existing.user.uid}_${Date.now()}`,
            },
        } as any;
    }

    // Auto-register demo user
    const newUser: MockUser = {
        uid: `user_${Date.now()}`,
        email: email.trim(),
        displayName: email.split("@")[0],
        photoURL: "https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABfjwSMBflnYO0ZFqOMwBzJebsoeNtggxczfg-980BcCr0IxJyW2rA8WRI0ndQnHP273DHAR2nHH26ZX54H9A43U5fZLqrxU.png?r=229",
    };
    users[emailKey] = { password, user: newUser };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    notifyListeners(newUser);

    return {
        user: {
            ...newUser,
            getIdToken: async () => `jwt_token_${newUser.uid}_${Date.now()}`,
        },
    } as any;
};

/**
 * Create User with Email and Password
 */
export const createUserWithEmailAndPassword = async (
    authInstance: Auth | null,
    email: string,
    password: string
): Promise<UserCredential | { user: MockUser }> => {
    if (auth && authInstance) {
        return await fbCreateUser(authInstance, email, password);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const emailKey = email.toLowerCase().trim();
    let users: Record<string, { password: string; user: MockUser }> = {};
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) users = JSON.parse(stored);
    } catch {
        users = {};
    }

    if (users[emailKey]) {
        const err: any = new Error("This email is already registered.");
        err.code = "auth/email-already-in-use";
        throw err;
    }

    const newUser: MockUser = {
        uid: `user_${Date.now()}`,
        email: email.trim(),
        displayName: email.split("@")[0],
        photoURL: "https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABfjwSMBflnYO0ZFqOMwBzJebsoeNtggxczfg-980BcCr0IxJyW2rA8WRI0ndQnHP273DHAR2nHH26ZX54H9A43U5fZLqrxU.png?r=229",
    };
    users[emailKey] = { password, user: newUser };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    notifyListeners(newUser);

    return {
        user: {
            ...newUser,
            getIdToken: async () => `jwt_token_${newUser.uid}_${Date.now()}`,
        },
    } as any;
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (
    authInstance: Auth | null,
    email: string
): Promise<{ resetCode?: string }> => {
    if (auth && authInstance) {
        await fbSendPasswordResetEmail(authInstance, email);
        return {};
    }

    // Local fallback: generate a simulated reset action code
    await new Promise((resolve) => setTimeout(resolve, 300));
    const emailKey = email.toLowerCase().trim();
    const mockCode = `reset_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    let resetCodes: Record<string, { email: string; expiresAt: number }> = {};
    try {
        const stored = localStorage.getItem(RESET_CODES_STORAGE_KEY);
        if (stored) resetCodes = JSON.parse(stored);
    } catch {
        resetCodes = {};
    }

    resetCodes[mockCode] = {
        email: emailKey,
        expiresAt: Date.now() + 3600 * 1000, // 1 hour
    };
    localStorage.setItem(RESET_CODES_STORAGE_KEY, JSON.stringify(resetCodes));

    return { resetCode: mockCode };
};

/**
 * Verify Password Reset Code
 */
export const verifyPasswordResetCode = async (
    authInstance: Auth | null,
    code: string
): Promise<string> => {
    if (auth && authInstance) {
        return await fbVerifyPasswordResetCode(authInstance, code);
    }

    try {
        const stored = localStorage.getItem(RESET_CODES_STORAGE_KEY);
        const resetCodes = stored ? JSON.parse(stored) : {};
        const entry = resetCodes[code];
        if (!entry || entry.expiresAt < Date.now()) {
            const err: any = new Error("Password reset link is invalid or expired.");
            err.code = "auth/invalid-action-code";
            throw err;
        }
        return entry.email;
    } catch (e: any) {
        if (e.code) throw e;
        const err: any = new Error("Invalid password reset code.");
        err.code = "auth/invalid-action-code";
        throw err;
    }
};

/**
 * Confirm Password Reset
 */
export const confirmPasswordReset = async (
    authInstance: Auth | null,
    code: string,
    newPassword: string
): Promise<void> => {
    if (auth && authInstance) {
        await fbConfirmPasswordReset(authInstance, code, newPassword);
        return;
    }

    const email = await verifyPasswordResetCode(null, code);
    let users: Record<string, { password: string; user: MockUser }> = {};
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) users = JSON.parse(stored);
    } catch {
        users = {};
    }

    if (users[email]) {
        users[email].password = newPassword;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    // Invalidate reset code
    try {
        const stored = localStorage.getItem(RESET_CODES_STORAGE_KEY);
        if (stored) {
            const resetCodes = JSON.parse(stored);
            delete resetCodes[code];
            localStorage.setItem(RESET_CODES_STORAGE_KEY, JSON.stringify(resetCodes));
        }
    } catch {
        // ignore
    }
};

/**
 * Update Profile
 */
export const updateProfile = async (
    user: FirebaseUser | MockUser,
    profile: { displayName?: string; photoURL?: string }
): Promise<void> => {
    if (auth && user && (user as FirebaseUser).getIdTokenResult) {
        await fbUpdateProfile(user as FirebaseUser, profile);
        return;
    }

    const mockUser = user as MockUser;
    if (profile.displayName !== undefined) mockUser.displayName = profile.displayName;
    if (profile.photoURL !== undefined) mockUser.photoURL = profile.photoURL;

    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    } catch {
        // storage fallback
    }
    notifyListeners(mockUser);
};

/**
 * Sign Out
 */
export const signOut = async (authInstance?: Auth | null): Promise<void> => {
    if (auth && authInstance) {
        await fbSignOut(authInstance);
        return;
    }

    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        // storage fallback
    }
    notifyListeners(null);
};

/**
 * Auth State Observer
 */
export const onAuthStateChanged = (
    authInstance: Auth | null,
    callback: (user: FirebaseUser | MockUser | null) => void
): (() => void) => {
    if (auth && authInstance) {
        return fbOnAuthStateChanged(authInstance, callback as any);
    }

    listeners.add(callback);
    setTimeout(() => {
        callback(getLocalStoredUser());
    }, 0);

    return () => {
        listeners.delete(callback);
    };
};

export { app, auth, db };
