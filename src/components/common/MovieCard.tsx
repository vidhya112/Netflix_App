import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Movie } from "../../types/movie.types";
import { getMediaImageUrl } from "../../utils/constant";
import { setSelectedMovie, openVideoModal } from "../../features/movieSlice";
import { addToWatchlist, removeFromWatchlist } from "../../features/watchlistSlice";
import { showToast } from "../../features/configSlice";
import { RootState } from "../../store/appStore";
import { language } from "../../utils/languageConstant";
import { getMovieDetails, getMovieTrailer } from "../../services/movieService";

import { Play, Plus, Check, Info, Star, Film } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  reason?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, reason }) => {
    const dispatch = useDispatch();
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;
    const watchlist = useSelector((state: RootState) => state.watchlist.items);

    const isInWatchlist = watchlist.some((item) => item.id === movie.id);
    const [imgError, setImgError] = useState(false);

    if (!movie.poster_path && !movie.backdrop_path && !movie.title && !movie.name) return null;

    const posterSrc = getMediaImageUrl(movie.poster_path || movie.backdrop_path);


    const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : movie.first_air_date
            ? new Date(movie.first_air_date).getFullYear()
            : null;

    const matchScore = Math.min(
        99,
        Math.max(70, Math.round((movie.vote_average || 7.5) * 10) + 4)
    );

    const handleOpenDetails = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const details = await getMovieDetails(movie.id);
        dispatch(setSelectedMovie(details || (movie as any)));
    };

    const handlePlayTrailer = async (e: React.MouseEvent) => {
        e.stopPropagation();
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

    const handleWatchlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isInWatchlist) {
            dispatch(removeFromWatchlist(movie.id));
            dispatch(showToast({ message: lang.removedFromWatchlist, type: "info" }));
        } else {
            dispatch(addToWatchlist(movie));
            dispatch(showToast({ message: lang.addedToWatchlist, type: "success" }));
        }
    };

    return (
        <div
            onClick={handleOpenDetails}
            className="group relative flex-none w-36 sm:w-44 md:w-52 aspect-[2/3] rounded-lg overflow-hidden cursor-pointer bg-[#1f1f1f] shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:z-20 hover:shadow-2xl hover:shadow-red-950/40 border border-white/5 hover:border-red-600/40"
        >
            {/* Poster Image or Clean Fallback */}
            {!imgError && posterSrc ? (
                <img
                    src={posterSrc}
                    alt={movie.title || movie.name || "Movie Poster"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-[#1a1a1a] to-zinc-950 flex flex-col items-center justify-center p-3 text-center border border-white/5">
                    <Film className="w-8 h-8 text-red-600/60 mb-2" />
                    <p className="text-xs font-bold text-gray-200 line-clamp-3">
                        {movie.title || movie.name}
                    </p>
                </div>
            )}

            {/* Top Rating Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-semibold text-amber-400 border border-white/10">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "7.8"}</span>
            </div>

            {/* Hover Overlay Card Details */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5">
                <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 drop-shadow-md">
                    {movie.title || movie.name}
                </h3>

                {reason ? (
                    <p className="text-[11px] text-amber-300/90 line-clamp-2 my-1 italic">
            "{reason}"
                    </p>
                ) : (
                    <p className="text-[11px] text-gray-300 line-clamp-2 my-1">
                        {movie.overview}
                    </p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-300 my-1">
                    <span className="text-green-400 font-bold">{matchScore}% {lang.matchScore}</span>
                    {releaseYear && <span>{releaseYear}</span>}
                    <span className="border border-gray-500 px-1 py-0.2 text-[10px] rounded">HD</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2 pt-1 border-t border-white/10">
                    <button
                        onClick={handlePlayTrailer}
                        className="p-2 rounded-full bg-white text-black hover:bg-red-600 hover:text-white transition-colors shadow-md"
                        title="Play Trailer"
                        aria-label="Play Trailer"
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                        onClick={handleWatchlistToggle}
                        className={`p-2 rounded-full border transition-colors ${
                            isInWatchlist
                                ? "bg-red-600 border-red-600 text-white"
                                : "border-white/40 bg-black/40 text-white hover:border-white hover:bg-white/20"
                        }`}
                        title={isInWatchlist ? lang.removedFromWatchlist : lang.addedToWatchlist}
                        aria-label="Toggle Watchlist"
                    >
                        {isInWatchlist ? (
                            <Check className="w-3.5 h-3.5" />
                        ) : (
                            <Plus className="w-3.5 h-3.5" />
                        )}
                    </button>

                    <button
                        onClick={handleOpenDetails}
                        className="p-2 rounded-full border border-white/40 bg-black/40 text-white hover:border-white hover:bg-white/20 ml-auto transition-colors"
                        title="More Information"
                        aria-label="More Info"
                    >
                        <Info className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
