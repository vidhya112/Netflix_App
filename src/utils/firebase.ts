/**
 * Lightweight Client Authentication Service
 * Replaces external Firebase Auth with resilient local session management.
 * Zero external API keys or third-party credentials required.
 */

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export interface UserCredential {
    user: User;
}

const AUTH_STORAGE_KEY = "netflix_gpt_current_user";
const USERS_STORAGE_KEY = "netflix_gpt_registered_users";

const DEFAULT_AVATAR =
    "https://occ-0-2794-2219.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABfjwSMBflnYO0ZFqOMwBzJebsoeNtggxczfg-980BcCr0IxJyW2rA8WRI0ndQnHP273DHAR2nHH26ZX54H9A43U5fZLqrxU.png?r=229";

type AuthListener = (user: User | null) => void;
const listeners: Set<AuthListener> = new Set();

const notifyListeners = (user: User | null) => {
    listeners.forEach((listener) => {
        try {
            listener(user);
        } catch (e) {
            console.error("Auth listener error:", e);
        }
    });
};

export const getCurrentUser = (): User | null => {
    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const auth = {
    get currentUser(): User | null {
        return getCurrentUser();
    },
};

export type Auth = typeof auth;

export const onAuthStateChanged = (
    _authInstance: any,
    callback: (user: User | null) => void
): (() => void) => {
    listeners.add(callback);
    // Dispatch initial state asynchronously
    setTimeout(() => {
        callback(getCurrentUser());
    }, 0);

    return () => {
        listeners.delete(callback);
    };
};

export const signInWithEmailAndPassword = async (
    _authInstance: any,
    email: string,
    password: string
): Promise<UserCredential> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!email || !password) {
        const error = new Error("Email and password are required");
        (error as any).code = "auth/invalid-credential";
        throw error;
    }

    let users: Record<string, { password: string; user: User }> = {};
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) users = JSON.parse(stored);
    } catch {
        users = {};
    }

    const emailKey = email.toLowerCase().trim();
    const registered = users[emailKey];

    if (registered) {
        if (registered.password !== password) {
            const error = new Error("Invalid password credentials.");
            (error as any).code = "auth/wrong-password";
            throw error;
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(registered.user));
        notifyListeners(registered.user);
        return { user: registered.user };
    }

    // Auto-create demo user for smooth first-time login
    const newUser: User = {
        uid: `user_${Date.now()}`,
        email: email.trim(),
        displayName: email.split("@")[0],
        photoURL: DEFAULT_AVATAR,
    };

    users[emailKey] = { password, user: newUser };
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
        // storage fallback
    }

    notifyListeners(newUser);
    return { user: newUser };
};

export const createUserWithEmailAndPassword = async (
    _authInstance: any,
    email: string,
    password: string
): Promise<UserCredential> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!email || !password) {
        const error = new Error("Email and password are required");
        (error as any).code = "auth/invalid-credential";
        throw error;
    }

    const emailKey = email.toLowerCase().trim();
    let users: Record<string, { password: string; user: User }> = {};
    try {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        if (stored) users = JSON.parse(stored);
    } catch {
        users = {};
    }

    const newUser: User = {
        uid: `user_${Date.now()}`,
        email: email.trim(),
        displayName: email.split("@")[0],
        photoURL: DEFAULT_AVATAR,
    };

    users[emailKey] = { password, user: newUser };
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
        // storage fallback
    }

    notifyListeners(newUser);
    return { user: newUser };
};

export const updateProfile = async (
    user: User,
    profile: { displayName?: string; photoURL?: string }
): Promise<void> => {
    if (profile.displayName !== undefined) user.displayName = profile.displayName;
    if (profile.photoURL !== undefined) user.photoURL = profile.photoURL;

    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
        // storage fallback
    }
    notifyListeners(user);
};

export const signOut = async (_authInstance?: any): Promise<void> => {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        // storage fallback
    }
    notifyListeners(null);
};

export const app = { name: "netflix-app" };
