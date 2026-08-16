import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Movie } from "../types/movie.types";
import { auth } from "../utils/firebase";
import {
    addMovieToFirestoreWatchlist,
    removeMovieFromFirestoreWatchlist,
} from "../services/firestoreService";

interface WatchlistState {
    items: Movie[];
}

const initialState: WatchlistState = {
    items: [],
};

const watchlistSlice = createSlice({
    name: "watchlist",
    initialState,
    reducers: {
        setWatchlistItems: (state, action: PayloadAction<Movie[]>) => {
            state.items = action.payload;
        },
        addToWatchlist: (state, action: PayloadAction<Movie>) => {
            const exists = state.items.some(
                (item) => String(item.id) === String(action.payload.id)
            );
            if (!exists) {
                state.items.unshift(action.payload);

                // Sync strictly to current authenticated user's Cloud Firestore
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

            // Sync strictly to current authenticated user's Cloud Firestore
            const currentUid = auth?.currentUser?.uid;
            if (currentUid) {
                removeMovieFromFirestoreWatchlist(currentUid, action.payload).catch(() => {});
            }
        },
        clearWatchlist: (state) => {
            state.items = [];
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
