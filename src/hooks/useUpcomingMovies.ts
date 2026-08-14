import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/appStore";
import { getUpcomingMovies } from "../services/movieService";

import { addUpcomingMovies } from "../features/movieSlice";

const useUpcomingMovies = () => {
    const dispatch = useDispatch();
    const upcomingMovies = useSelector(
        (state: RootState) => state.movies.upcomingMovies
    );

    useEffect(() => {
        let isMounted = true;
        const fetchMovies = async () => {
            if (!upcomingMovies) {
                const movies = await getUpcomingMovies();
                if (isMounted && movies) {
                    dispatch(addUpcomingMovies(movies));
                }
            }
        };

        fetchMovies();
        return () => {
            isMounted = false;
        };
    }, [dispatch, upcomingMovies]);
};

export default useUpcomingMovies;
