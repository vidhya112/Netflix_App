import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { MovieBannerTrailer } from "./MovieBannerTrailer";
import { MovieBannerTitle } from "./MovieBannerTitle";

export const MovieBanner: React.FC = () => {
    const nowPlayingMovies = useSelector(
        (state: RootState) => state.movies.nowPlayingMovies
    );

    const mainMovie = nowPlayingMovies?.[0] || null;

    if (!mainMovie) {
        return (
            <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] min-h-[500px] sm:min-h-[560px] max-h-[850px] bg-[#141414] overflow-hidden flex items-end p-6 sm:p-12 md:p-16 animate-pulse">
                <div className="w-full max-w-xl space-y-4 z-20">
                    <div className="h-10 sm:h-16 w-3/4 bg-white/10 rounded-xl" />
                    <div className="h-4 sm:h-5 w-full bg-white/10 rounded" />
                    <div className="h-4 sm:h-5 w-2/3 bg-white/10 rounded" />
                    <div className="flex gap-4 pt-4">
                        <div className="h-11 w-28 bg-white/20 rounded-xl" />
                        <div className="h-11 w-32 bg-white/10 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section
            className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] min-h-[500px] sm:min-h-[560px] max-h-[850px] overflow-hidden bg-[#141414]"
            aria-label="Featured Movie"
        >
            <MovieBannerTrailer movieId={mainMovie.id} />
            <MovieBannerTitle movie={mainMovie} />
        </section>
    );
};
