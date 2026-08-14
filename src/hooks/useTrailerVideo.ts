import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMovieTrailer } from "../services/movieService";

import { addTrailerVideo } from "../features/movieSlice";

const useTrailerVideo = (movieId?: number) => {
    const dispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;
        if (!movieId) return;

        const fetchTrailer = async () => {
            const trailer = await getMovieTrailer(movieId);
            if (isMounted && trailer) {
                dispatch(addTrailerVideo(trailer));
            }
        };

        fetchTrailer();
        return () => {
            isMounted = false;
        };
    }, [dispatch, movieId]);
};

export default useTrailerVideo;
