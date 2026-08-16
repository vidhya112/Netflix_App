import {
    doc,
    setDoc,
    getDocs,
    collection,
    onSnapshot,
    deleteDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { UserSession } from "../types/user.types";
import { WatchlistItem } from "../types/movie.types";

const SESSIONS_LOCAL_KEY = "netflix_gpt_device_sessions";
const WATCHLIST_LOCAL_KEY = "netflix_gpt_local_watchlist";
const GPT_HISTORY_LOCAL_KEY = "netflix_gpt_search_history";

/**
 * Check if the user is authenticated through real Firebase Auth
 */
const isRealAuthUser = (uid: string): boolean => {
    return Boolean(auth?.currentUser && auth.currentUser.uid === uid && !uid.startsWith("guest_"));
};

/**
 * Detect client browser, OS, and device information
 */
export const getClientDeviceInfo = (): {
    deviceId: string;
    deviceName: string;
    browser: string;
    os: string;
} => {
    let deviceId = localStorage.getItem("netflix_gpt_device_id");
    if (!deviceId) {
        deviceId = `dev_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
        localStorage.setItem("netflix_gpt_device_id", deviceId);
    }

    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.includes("Firefox/")) browser = "Mozilla Firefox";
    else if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome/")) browser = "Google Chrome";
    else if (ua.includes("Safari/")) browser = "Apple Safari";
    else if (ua.includes("Opera/") || ua.includes("OPR/")) browser = "Opera";

    let os = "Unknown OS";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    const isMobile = /Mobi|Android/i.test(ua);
    const deviceName = `${os} (${isMobile ? "Mobile" : "Desktop"}) • ${browser}`;

    return { deviceId, deviceName, browser, os };
};

/**
 * Sync user profile to Firestore
 */
export const syncUserProfileToFirestore = async (
    uid: string,
    profileData: {
        email: string | null;
        displayName: string | null;
        photoURL?: string | null;
        lang?: string;
    }
): Promise<void> => {
    if (!uid) return;

    if (db && isRealAuthUser(uid)) {
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(
                userRef,
                {
                    ...profileData,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );
            return;
        } catch (err) {
            console.warn("Firestore syncUserProfile error, falling back:", err);
        }
    }
};

/**
 * Register a login session in Firestore
 */
export const registerUserSession = async (uid: string): Promise<UserSession> => {
    const { deviceId, deviceName, browser, os } = getClientDeviceInfo();
    const sessionId = `session_${deviceId}`;
    const now = new Date().toISOString();

    const session: UserSession = {
        id: sessionId,
        deviceId,
        deviceName,
        browser,
        os,
        ip: "Local / HTTPS Edge",
        createdAt: now,
        lastActive: now,
        isCurrentSession: true,
        status: "active",
    };

    if (db && isRealAuthUser(uid)) {
        try {
            const sessionRef = doc(db, "users", uid, "sessions", sessionId);
            await setDoc(
                sessionRef,
                {
                    ...session,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );
            return session;
        } catch (err) {
            console.warn("Firestore session registration fallback:", err);
        }
    }

    // Local Storage Session Management Fallback
    try {
        const stored = localStorage.getItem(`${SESSIONS_LOCAL_KEY}_${uid}`);
        let sessions: UserSession[] = stored ? JSON.parse(stored) : [];
        sessions = sessions.filter((s) => s.id !== sessionId);
        sessions.unshift(session);
        localStorage.setItem(`${SESSIONS_LOCAL_KEY}_${uid}`, JSON.stringify(sessions));
    } catch {
        // ignore
    }

    return session;
};

/**
 * Fetch all active sessions for a user
 */
export const fetchUserSessions = async (uid: string): Promise<UserSession[]> => {
    if (!uid) return [];
    const { deviceId } = getClientDeviceInfo();
    const currentSessionId = `session_${deviceId}`;

    if (db && isRealAuthUser(uid)) {
        try {
            const sessionsCol = collection(db, "users", uid, "sessions");
            const snapshot = await getDocs(sessionsCol);
            const list: UserSession[] = [];
            snapshot.forEach((d) => {
                const data = d.data() as UserSession;
                list.push({
                    ...data,
                    id: d.id,
                    isCurrentSession: d.id === currentSessionId,
                });
            });
            if (list.length > 0) return list;
        } catch (err) {
            console.warn("Firestore fetchUserSessions fallback:", err);
        }
    }

    // Fallback
    try {
        const stored = localStorage.getItem(`${SESSIONS_LOCAL_KEY}_${uid}`);
        if (stored) {
            const sessions: UserSession[] = JSON.parse(stored);
            return sessions.map((s) => ({
                ...s,
                isCurrentSession: s.id === currentSessionId,
            }));
        }
    } catch {
        // ignore
    }

    // Default current session if none exist
    const defaultSession = await registerUserSession(uid);
    return [defaultSession];
};

/**
 * Revoke/Terminate a session
 */
export const revokeUserSession = async (uid: string, sessionId: string): Promise<void> => {
    if (!uid || !sessionId) return;

    if (db && isRealAuthUser(uid)) {
        try {
            const sessionRef = doc(db, "users", uid, "sessions", sessionId);
            await updateDoc(sessionRef, {
                status: "revoked",
                revokedAt: serverTimestamp(),
            });
            return;
        } catch (err) {
            console.warn("Firestore revoke session fallback:", err);
        }
    }

    try {
        const stored = localStorage.getItem(`${SESSIONS_LOCAL_KEY}_${uid}`);
        if (stored) {
            let sessions: UserSession[] = JSON.parse(stored);
            sessions = sessions.map((s) => (s.id === sessionId ? { ...s, status: "revoked" } : s));
            localStorage.setItem(`${SESSIONS_LOCAL_KEY}_${uid}`, JSON.stringify(sessions));
        }
    } catch {
        // ignore
    }
};

/**
 * Revoke all other sessions
 */
export const revokeAllOtherSessions = async (uid: string): Promise<void> => {
    if (!uid) return;
    const { deviceId } = getClientDeviceInfo();
    const currentSessionId = `session_${deviceId}`;

    if (db && isRealAuthUser(uid)) {
        try {
            const sessionsCol = collection(db, "users", uid, "sessions");
            const snapshot = await getDocs(sessionsCol);
            for (const docSnap of snapshot.docs) {
                if (docSnap.id !== currentSessionId) {
                    await updateDoc(docSnap.ref, {
                        status: "revoked",
                        revokedAt: serverTimestamp(),
                    });
                }
            }
            return;
        } catch (err) {
            console.warn("Firestore revoke all other sessions fallback:", err);
        }
    }

    try {
        const stored = localStorage.getItem(`${SESSIONS_LOCAL_KEY}_${uid}`);
        if (stored) {
            let sessions: UserSession[] = JSON.parse(stored);
            sessions = sessions.filter((s) => s.id === currentSessionId);
            localStorage.setItem(`${SESSIONS_LOCAL_KEY}_${uid}`, JSON.stringify(sessions));
        }
    } catch {
        // ignore
    }
};

/**
 * Real-time Watchlist Subscription
 */
export const subscribeToWatchlist = (
    uid: string,
    onUpdate: (items: WatchlistItem[]) => void
): (() => void) => {
    if (!uid) {
        return () => {};
    }

    const loadLocal = () => {
        try {
            const userKey = `${WATCHLIST_LOCAL_KEY}_${uid}`;
            const globalKey = "netflix_gpt_watchlist";
            const userStored = localStorage.getItem(userKey);
            const globalStored = localStorage.getItem(globalKey);
            const stored = userStored || globalStored;
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    onUpdate(parsed);
                }
            }
        } catch {
            // ignore
        }
    };
    loadLocal();

    if (db && isRealAuthUser(uid)) {
        try {
            const watchlistCol = collection(db, "users", uid, "watchlist");
            const unsubscribe = onSnapshot(
                watchlistCol,
                (snapshot) => {
                    const items: WatchlistItem[] = [];
                    snapshot.forEach((d) => {
                        items.push(d.data() as WatchlistItem);
                    });
                    onUpdate(items);
                    try {
                        localStorage.setItem(`${WATCHLIST_LOCAL_KEY}_${uid}`, JSON.stringify(items));
                        localStorage.setItem("netflix_gpt_watchlist", JSON.stringify(items));
                    } catch {
                        // ignore
                    }
                },
                (err) => {
                    console.warn("Watchlist onSnapshot fallback to local storage:", err);
                    loadLocal();
                }
            );
            return unsubscribe;
        } catch (e) {
            console.warn("Firestore subscribeToWatchlist failed:", e);
        }
    }

    const storageHandler = (e: StorageEvent) => {
        if (e.key === "netflix_gpt_watchlist" || e.key === `${WATCHLIST_LOCAL_KEY}_${uid}`) {
            loadLocal();
        }
    };
    window.addEventListener("storage", storageHandler);

    return () => {
        window.removeEventListener("storage", storageHandler);
    };
};

/**
 * Add movie to Watchlist in Firestore
 */
export const addMovieToFirestoreWatchlist = async (
    uid: string,
    movie: WatchlistItem
): Promise<void> => {
    if (!uid || !movie || !movie.id) return;

    if (db && isRealAuthUser(uid)) {
        try {
            const movieRef = doc(db, "users", uid, "watchlist", String(movie.id));
            await setDoc(movieRef, {
                ...movie,
                addedAt: movie.addedAt || new Date().toISOString(),
            });
            return;
        } catch (err) {
            console.warn("Firestore addMovieToWatchlist error, saving locally:", err);
        }
    }

    // Local fallback
    try {
        const userKey = `${WATCHLIST_LOCAL_KEY}_${uid}`;
        const globalKey = "netflix_gpt_watchlist";
        const stored = localStorage.getItem(userKey) || localStorage.getItem(globalKey);
        const items: WatchlistItem[] = stored ? JSON.parse(stored) : [];
        if (!items.some((item) => String(item.id) === String(movie.id))) {
            items.unshift({ ...movie, addedAt: new Date().toISOString() });
            localStorage.setItem(userKey, JSON.stringify(items));
            localStorage.setItem(globalKey, JSON.stringify(items));
        }
    } catch {
        // ignore
    }
};

/**
 * Remove movie from Watchlist in Firestore
 */
export const removeMovieFromFirestoreWatchlist = async (
    uid: string,
    movieId: number | string
): Promise<void> => {
    if (!uid || !movieId) return;

    if (db && isRealAuthUser(uid)) {
        try {
            const movieRef = doc(db, "users", uid, "watchlist", String(movieId));
            await deleteDoc(movieRef);
            return;
        } catch (err) {
            console.warn("Firestore removeMovieFromWatchlist error, removing locally:", err);
        }
    }

    // Local fallback
    try {
        const userKey = `${WATCHLIST_LOCAL_KEY}_${uid}`;
        const globalKey = "netflix_gpt_watchlist";
        const stored = localStorage.getItem(userKey) || localStorage.getItem(globalKey);
        if (stored) {
            let items: WatchlistItem[] = JSON.parse(stored);
            items = items.filter((item) => String(item.id) !== String(movieId));
            localStorage.setItem(userKey, JSON.stringify(items));
            localStorage.setItem(globalKey, JSON.stringify(items));
        }
    } catch {
        // ignore
    }
};

/**
 * Save GPT Recommendation Search to Firestore
 */
export const saveGptSearchToFirestore = async (
    uid: string,
    searchQuery: string,
    movieNames: string[]
): Promise<void> => {
    if (!uid || !searchQuery) return;
    const historyId = `search_${Date.now()}`;

    if (db && isRealAuthUser(uid)) {
        try {
            const searchRef = doc(db, "users", uid, "gptHistory", historyId);
            await setDoc(searchRef, {
                query: searchQuery,
                results: movieNames,
                timestamp: serverTimestamp(),
            });
            return;
        } catch (err) {
            console.warn("Firestore saveGptSearch fallback:", err);
        }
    }

    try {
        const stored = localStorage.getItem(`${GPT_HISTORY_LOCAL_KEY}_${uid}`);
        const history = stored ? JSON.parse(stored) : [];
        history.unshift({ query: searchQuery, results: movieNames, timestamp: new Date().toISOString() });
        localStorage.setItem(`${GPT_HISTORY_LOCAL_KEY}_${uid}`, JSON.stringify(history.slice(0, 20)));
    } catch {
        // ignore
    }
};
