import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { MovieRow } from "./MovieRow";
import { language } from "../../utils/languageConstant";

export const MovieCategory: React.FC = () => {
    const {
        nowPlayingMovies,
        popularMovies,
        topRatedMovies,
        upcomingMovies,
        trendingMovies,
    } = useSelector((state: RootState) => state.movies);

    const watchlist = useSelector((state: RootState) => state.watchlist.items);
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;

    return (
        <div className="relative -mt-6 sm:-mt-12 md:-mt-16 z-20 space-y-3 sm:space-y-6 pb-20 bg-gradient-to-t from-[#141414] via-[#141414] to-transparent">
            {/* Watchlist row if user has saved items */}
            {watchlist && watchlist.length > 0 && (
                <MovieRow
                    title={lang.myList}
                    movies={watchlist}
                    badge={`${watchlist.length} Saved`}
                />
            )}

            {/* Trending Now */}
            <MovieRow
                title={lang.trending}
                movies={trendingMovies}
                badge="Hot"
            />

            {/* Popular Movies */}
            <MovieRow
                title={lang.popular}
                movies={popularMovies}
            />

            {/* Top Rated */}
            <MovieRow
                title={lang.topRated}
                movies={topRatedMovies}
                badge="⭐ 8.0+"
            />

            {/* Now Playing */}
            <MovieRow
                title={lang.nowPlaying}
                movies={nowPlayingMovies}
            />

            {/* Upcoming */}
            <MovieRow
                title={lang.upcoming}
                movies={upcomingMovies}
            />
        </div>
    );
};
