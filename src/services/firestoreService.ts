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
import { db } from "../utils/firebase";
import { UserSession } from "../types/user.types";
import { WatchlistItem } from "../types/movie.types";

/**
 * Check if Firestore is available and user is a real registered account
 */
const canUseFirestore = (uid?: string): boolean => {
    return Boolean(db && uid && !uid.startsWith("guest_"));
};

/**
 * Clean and sanitize data to remove undefined values before passing to Firestore
 */
const cleanFirestoreData = (data: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            cleaned[key] = value;
        }
    }
    return cleaned;
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
        try {
            localStorage.setItem("netflix_gpt_device_id", deviceId);
        } catch {
            // ignore
        }
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
 * Sync user profile to Firestore (users/{uid})
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
    if (!canUseFirestore(uid) || !db) return;

    try {
        const userRef = doc(db, "users", uid);
        const payload = cleanFirestoreData({
            email: profileData.email || null,
            displayName: profileData.displayName || null,
            photoURL: profileData.photoURL || null,
            lang: profileData.lang || "en",
            updatedAt: serverTimestamp(),
        });
        await setDoc(userRef, payload, { merge: true });
        console.log(`[Firestore] Successfully synced profile for ${uid}`);
    } catch (err) {
        console.error("Firestore syncUserProfile error:", err);
    }
};

/**
 * Register a login session in Firestore (users/{uid}/sessions/{sessionId})
 */
export const registerUserSession = async (uid: string): Promise<UserSession> => {
    const { deviceId, deviceName, browser, os } = getClientDeviceInfo();
    const sessionId = `session_${deviceId}`;
    const now = new Date().toISOString();

    const session: UserSession = {
        id: sessionId,
        deviceId: deviceId || "unknown_device",
        deviceName: deviceName || "Web Device",
        browser: browser || "Web Browser",
        os: os || "Unknown OS",
        ip: "Local / HTTPS Edge",
        createdAt: now,
        lastActive: now,
        isCurrentSession: true,
        status: "active",
    };

    if (canUseFirestore(uid) && db) {
        try {
            const sessionRef = doc(db, "users", uid, "sessions", sessionId);
            const payload = cleanFirestoreData({
                ...session,
                updatedAt: serverTimestamp(),
            });
            await setDoc(sessionRef, payload, { merge: true });
            console.log(`[Firestore] Successfully registered session for ${uid}`);
            return session;
        } catch (err) {
            console.error("Firestore session registration error:", err);
        }
    }

    return session;
};

/**
 * Fetch all active sessions for a user (users/{uid}/sessions)
 */
export const fetchUserSessions = async (uid: string): Promise<UserSession[]> => {
    if (!uid) return [];
    const { deviceId } = getClientDeviceInfo();
    const currentSessionId = `session_${deviceId}`;

    if (canUseFirestore(uid) && db) {
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
            console.error("Firestore fetchUserSessions error:", err);
        }
    }

    const defaultSession = await registerUserSession(uid);
    return [defaultSession];
};

/**
 * Revoke/Terminate a session
 */
export const revokeUserSession = async (uid: string, sessionId: string): Promise<void> => {
    if (!canUseFirestore(uid) || !sessionId || !db) return;

    try {
        const sessionRef = doc(db, "users", uid, "sessions", sessionId);
        await updateDoc(sessionRef, {
            status: "revoked",
            revokedAt: serverTimestamp(),
        });
    } catch (err) {
        console.error("Firestore revoke session error:", err);
    }
};

/**
 * Revoke all other sessions
 */
export const revokeAllOtherSessions = async (uid: string): Promise<void> => {
    if (!canUseFirestore(uid) || !db) return;
    const { deviceId } = getClientDeviceInfo();
    const currentSessionId = `session_${deviceId}`;

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
    } catch (err) {
        console.error("Firestore revoke all other sessions error:", err);
    }
};

/**
 * Real-time Watchlist Subscription (users/{uid}/watchlist)
 */
export const subscribeToWatchlist = (
    uid: string,
    onUpdate: (items: WatchlistItem[]) => void
): (() => void) => {
    if (!canUseFirestore(uid) || !db) {
        onUpdate([]);
        return () => {};
    }

    try {
        const watchlistCol = collection(db, "users", uid, "watchlist");
        const unsubscribe = onSnapshot(
            watchlistCol,
            (snapshot) => {
                const items: WatchlistItem[] = [];
                snapshot.forEach((d) => {
                    items.push(d.data() as WatchlistItem);
                });
                console.log(`[Firestore] Watchlist snapshot loaded: ${items.length} items for ${uid}`);
                onUpdate(items);
            },
            (err) => {
                console.error("Watchlist onSnapshot error:", err);
            }
        );
        return unsubscribe;
    } catch (e) {
        console.error("Firestore subscribeToWatchlist failed:", e);
        return () => {};
    }
};

/**
 * Add movie to Watchlist in Firestore (users/{uid}/watchlist/{movieId})
 */
export const addMovieToFirestoreWatchlist = async (
    uid: string,
    movie: WatchlistItem
): Promise<void> => {
    if (!canUseFirestore(uid) || !movie || !movie.id || !db) return;

    try {
        const movieRef = doc(db, "users", uid, "watchlist", String(movie.id));
        const payload = cleanFirestoreData({
            id: movie.id,
            title: movie.title || movie.name || "Untitled",
            name: movie.name || movie.title || "Untitled",
            overview: movie.overview || "",
            poster_path: movie.poster_path || null,
            backdrop_path: movie.backdrop_path || null,
            release_date: movie.release_date || movie.first_air_date || null,
            vote_average: typeof movie.vote_average === "number" ? movie.vote_average : 7.5,
            vote_count: typeof movie.vote_count === "number" ? movie.vote_count : 100,
            addedAt: movie.addedAt || new Date().toISOString(),
        });

        await setDoc(movieRef, payload, { merge: true });
        console.log(`[Firestore] Successfully saved movie ${movie.id} to watchlist for user ${uid}`);
    } catch (err) {
        console.error("Firestore addMovieToWatchlist error:", err);
    }
};

/**
 * Remove movie from Watchlist in Firestore (users/{uid}/watchlist/{movieId})
 */
export const removeMovieFromFirestoreWatchlist = async (
    uid: string,
    movieId: number | string
): Promise<void> => {
    if (!canUseFirestore(uid) || !movieId || !db) return;

    try {
        const movieRef = doc(db, "users", uid, "watchlist", String(movieId));
        await deleteDoc(movieRef);
        console.log(`[Firestore] Successfully removed movie ${movieId} from watchlist for user ${uid}`);
    } catch (err) {
        console.error("Firestore removeMovieFromWatchlist error:", err);
    }
};

/**
 * Save GPT Recommendation Search to Firestore (users/{uid}/gptHistory/{historyId})
 */
export const saveGptSearchToFirestore = async (
    uid: string,
    searchQuery: string,
    movieNames: string[]
): Promise<void> => {
    if (!canUseFirestore(uid) || !searchQuery || !db) return;
    const historyId = `search_${Date.now()}`;

    try {
        const searchRef = doc(db, "users", uid, "gptHistory", historyId);
        const payload = cleanFirestoreData({
            query: searchQuery,
            results: movieNames,
            timestamp: serverTimestamp(),
        });
        await setDoc(searchRef, payload);
    } catch (err) {
        console.error("Firestore saveGptSearch error:", err);
    }
};
