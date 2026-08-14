import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Movie } from "../types/movie.types";

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
        addToWatchlist: (state, action: PayloadAction<Movie>) => {
            const exists = state.items.some((item) => item.id === action.payload.id);
            if (!exists) {
                state.items.unshift(action.payload);
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
                } catch (e) {
                    console.error(e);
                }
            }
        },
        removeFromWatchlist: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
            } catch (e) {
                console.error(e);
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

export const { addToWatchlist, removeFromWatchlist, clearWatchlist } = watchlistSlice.actions;
export default watchlistSlice.reducer;
