import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/appStore";
import { getTopRatedMovies } from "../services/movieService";

import { addTopRatedMovies } from "../features/movieSlice";

const useTopRatedMovies = () => {
    const dispatch = useDispatch();
    const topRatedMovies = useSelector(
        (state: RootState) => state.movies.topRatedMovies
    );

    useEffect(() => {
        let isMounted = true;
        const fetchMovies = async () => {
            if (!topRatedMovies) {
                const movies = await getTopRatedMovies();
                if (isMounted && movies) {
                    dispatch(addTopRatedMovies(movies));
                }
            }
        };

        fetchMovies();
        return () => {
            isMounted = false;
        };
    }, [dispatch, topRatedMovies]);
};

export default useTopRatedMovies;
