import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { Movie } from "../../types/movie.types";
import { setSelectedMovie, openVideoModal } from "../../features/movieSlice";
import { addToWatchlist, removeFromWatchlist } from "../../features/watchlistSlice";
import { toggleMute, showToast } from "../../features/configSlice";
import { language } from "../../utils/languageConstant";
import { getMovieDetails, getMovieTrailer } from "../../services/movieService";

import { Play, Info, Volume2, VolumeX, Plus, Check } from "lucide-react";

interface MovieBannerTitleProps {
    movie: Movie;
}

export const MovieBannerTitle: React.FC<MovieBannerTitleProps> = ({ movie }) => {
    const dispatch = useDispatch();
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;
    const isMuted = useSelector((state: RootState) => state.config.isMuted);
    const watchlist = useSelector((state: RootState) => state.watchlist.items);

    const isInWatchlist = watchlist.some((item) => item.id === movie.id);

    const handlePlay = async () => {
        const trailer = await getMovieTrailer(movie.id);
        if (trailer?.key) {
            dispatch(
                openVideoModal({
                    trailerKey: trailer.key,
                    title: movie.title || movie.name || "Movie Trailer",
                })
            );
        } else {
            const details = await getMovieDetails(movie.id);
            dispatch(setSelectedMovie(details || (movie as any)));
        }
    };

    const handleMoreInfo = async () => {
        const details = await getMovieDetails(movie.id);
        dispatch(setSelectedMovie(details || (movie as any)));
    };

    const handleWatchlistToggle = () => {
        if (isInWatchlist) {
            dispatch(removeFromWatchlist(movie.id));
            dispatch(showToast({ message: lang.removedFromWatchlist, type: "info" }));
        } else {
            dispatch(addToWatchlist(movie));
            dispatch(showToast({ message: lang.addedToWatchlist, type: "success" }));
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 md:px-14 pb-14 sm:pb-20 md:pb-28 z-10">
            {/* Left Movie Info */}
            <div className="max-w-2xl space-y-2.5 sm:space-y-4">
                {/* Netflix Top 10 Badge */}
                <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black tracking-widest px-2 py-0.5 rounded shadow-md">
                        TOP 10
                    </span>
                    <span className="text-xs sm:text-sm font-semibold tracking-wider text-gray-300 uppercase">
                        #1 in Movies Today
                    </span>
                </div>

                {/* Movie Title */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-2xl line-clamp-2">
                    {movie.title || movie.name}
                </h1>

                {/* Movie Overview */}
                <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-lg max-w-xl">
                    {movie.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
                    <button
                        onClick={handlePlay}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 sm:px-7 sm:py-3 rounded-lg font-bold text-xs sm:text-base hover:bg-white/85 transition-all duration-200 shadow-xl shadow-black/50 hover:scale-105 active:scale-95"
                    >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        {lang.play}
                    </button>

                    <button
                        onClick={handleMoreInfo}
                        className="flex items-center gap-2 bg-white/25 backdrop-blur-md text-white px-3.5 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-xs sm:text-base hover:bg-white/35 transition-all duration-200 shadow-xl border border-white/10 hover:scale-105 active:scale-95"
                    >
                        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                        {lang.moreInfo}
                    </button>

                    <button
                        onClick={handleWatchlistToggle}
                        className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                            isInWatchlist
                                ? "bg-red-600 border-red-600 text-white"
                                : "bg-black/40 border-white/20 text-white hover:bg-white/20"
                        }`}
                        title={isInWatchlist ? lang.removedFromWatchlist : lang.addedToWatchlist}
                    >
                        {isInWatchlist ? (
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Aligned Floating Audio Toggle & Age Rating on Bottom Right */}
            <div className="absolute right-4 sm:right-8 md:right-14 bottom-14 sm:bottom-20 md:bottom-28 flex items-center gap-2 sm:gap-3">
                <button
                    onClick={() => dispatch(toggleMute())}
                    className="p-2 sm:p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 border border-white/20 transition-all hover:scale-110 shadow-lg"
                    title={isMuted ? "Unmute sound" : "Mute sound"}
                    aria-label="Toggle Sound"
                >
                    {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" />
                    ) : (
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 animate-pulse" />
                    )}
                </button>

                <span className="bg-black/60 border-l-2 border-red-600 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 uppercase tracking-wider rounded-r">
                    16+
                </span>
            </div>
        </div>
    );
};
