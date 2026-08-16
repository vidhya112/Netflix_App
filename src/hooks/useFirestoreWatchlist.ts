import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/appStore";
import { setWatchlistItems } from "../features/watchlistSlice";
import { subscribeToWatchlist } from "../services/firestoreService";
import { Movie } from "../types/movie.types";

/**
 * Custom hook to keep Redux Watchlist synced with Cloud Firestore in real time
 */
export const useFirestoreWatchlist = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        if (!user || !user.uid) return;

        const unsubscribe = subscribeToWatchlist(user.uid, (firestoreItems) => {
            if (firestoreItems) {
                dispatch(setWatchlistItems(firestoreItems as unknown as Movie[]));
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user, dispatch]);
};
