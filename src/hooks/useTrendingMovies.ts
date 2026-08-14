import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/appStore";
import { getTrendingMovies } from "../services/movieService";

import { addTrendingMovies } from "../features/movieSlice";

const useTrendingMovies = () => {
    const dispatch = useDispatch();
    const trendingMovies = useSelector(
        (state: RootState) => state.movies.trendingMovies
    );

    useEffect(() => {
        let isMounted = true;
        const fetchMovies = async () => {
            if (!trendingMovies) {
                const movies = await getTrendingMovies();
                if (isMounted && movies) {
                    dispatch(addTrendingMovies(movies));
                }
            }
        };

        fetchMovies();
        return () => {
            isMounted = false;
        };
    }, [dispatch, trendingMovies]);
};

export default useTrendingMovies;
