import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Movie } from "../types/movie.types";
import { auth } from "../utils/firebase";
import {
    addMovieToFirestoreWatchlist,
    removeMovieFromFirestoreWatchlist,
} from "../services/firestoreService";

const LOCAL_STORAGE_KEY = "netflix_gpt_watchlist";

const loadInitialWatchlist = (): Movie[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

interface WatchlistState {
    items: Movie[];
}

const initialState: WatchlistState = {
    items: loadInitialWatchlist(),
};

const watchlistSlice = createSlice({
    name: "watchlist",
    initialState,
    reducers: {
        setWatchlistItems: (state, action: PayloadAction<Movie[]>) => {
            state.items = action.payload;
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(action.payload));
            } catch (e) {
                console.error(e);
            }
        },
        addToWatchlist: (state, action: PayloadAction<Movie>) => {
            const exists = state.items.some(
                (item) => String(item.id) === String(action.payload.id)
            );
            if (!exists) {
                state.items.unshift(action.payload);
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
                } catch (e) {
                    console.error(e);
                }

                // Sync to Cloud Firestore if user is active
                const currentUid = auth?.currentUser?.uid;
                if (currentUid) {
                    addMovieToFirestoreWatchlist(currentUid, action.payload as any).catch(() => {});
                }
            }
        },
        removeFromWatchlist: (state, action: PayloadAction<number | string>) => {
            state.items = state.items.filter(
                (item) => String(item.id) !== String(action.payload)
            );
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
            } catch (e) {
                console.error(e);
            }

            // Sync to Cloud Firestore if user is active
            const currentUid = auth?.currentUser?.uid;
            if (currentUid) {
                removeMovieFromFirestoreWatchlist(currentUid, action.payload).catch(() => {});
            }
        },
        clearWatchlist: (state) => {
            state.items = [];
            try {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            } catch (e) {
                console.error(e);
            }
        },
    },
});

export const {
    setWatchlistItems,
    addToWatchlist,
    removeFromWatchlist,
    clearWatchlist,
} = watchlistSlice.actions;

export default watchlistSlice.reducer;
