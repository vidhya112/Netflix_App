import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/appStore";
import { getPopularMovies } from "../services/movieService";

import { addPopularMovies } from "../features/movieSlice";

const usePopularMovies = () => {
    const dispatch = useDispatch();
    const popularMovies = useSelector(
        (state: RootState) => state.movies.popularMovies
    );

    useEffect(() => {
        let isMounted = true;
        const fetchMovies = async () => {
            if (!popularMovies) {
                const movies = await getPopularMovies();
                if (isMounted && movies) {
                    dispatch(addPopularMovies(movies));
                }
            }
        };

        fetchMovies();
        return () => {
            isMounted = false;
        };
    }, [dispatch, popularMovies]);
};

export default usePopularMovies;
