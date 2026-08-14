import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/appStore";
import { getNowPlayingMovies } from "../services/movieService";

import { addNowPlayingMovies } from "../features/movieSlice";

const useNowPlayingMovies = () => {
    const dispatch = useDispatch();
    const nowPlayingMovies = useSelector(
        (state: RootState) => state.movies.nowPlayingMovies
    );

    useEffect(() => {
        let isMounted = true;
        const fetchMovies = async () => {
            if (!nowPlayingMovies) {
                const movies = await getNowPlayingMovies();
                if (isMounted && movies) {
                    dispatch(addNowPlayingMovies(movies));
                }
            }
        };

        fetchMovies();
        return () => {
            isMounted = false;
        };
    }, [dispatch, nowPlayingMovies]);
};

export default useNowPlayingMovies;
