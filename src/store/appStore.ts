import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import moviesReducer from "../features/movieSlice";
import gptReducer from "../features/gptSlice";
import configReducer from "../features/configSlice";
import watchlistReducer from "../features/watchlistSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        movies: moviesReducer,
        gpt: gptReducer,
        config: configReducer,
        watchlist: watchlistReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
