import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/appStore";
import { setWatchlistItems, clearWatchlist } from "../features/watchlistSlice";
import { subscribeToWatchlist } from "../services/firestoreService";
import { Movie } from "../types/movie.types";

/**
 * Custom hook to keep Redux Watchlist strictly isolated and synced with Cloud Firestore for the logged-in user
 */
export const useFirestoreWatchlist = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        if (!user || !user.uid) {
            // When not logged in or logged out, immediately clear watchlist from Redux
            dispatch(clearWatchlist());
            return;
        }

        // Subscribe to current user's isolated Firestore watchlist collection
        const unsubscribe = subscribeToWatchlist(user.uid, (firestoreItems) => {
            if (Array.isArray(firestoreItems)) {
                dispatch(setWatchlistItems(firestoreItems as unknown as Movie[]));
            } else {
                dispatch(clearWatchlist());
            }
        });

        return () => {
            unsubscribe();
            dispatch(clearWatchlist());
        };
    }, [user?.uid, dispatch]);
};
