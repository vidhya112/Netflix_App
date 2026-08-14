import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/appStore";
import { SkeletonCard } from "../common/SkeletonCard";
import { language } from "../../utils/languageConstant";
import { setSelectedMovie, openVideoModal } from "../../features/movieSlice";
import { addToWatchlist, removeFromWatchlist } from "../../features/watchlistSlice";
import { showToast } from "../../features/configSlice";
import { getMovieDetails, getMovieTrailer } from "../../services/movieService";

import { getMediaImageUrl } from "../../utils/constant";
import { Sparkles, AlertCircle, Play, Info, Plus, Check, Star, Film } from "lucide-react";
import { Movie } from "../../types/movie.types";

interface GptMovieCardProps {
    movieName: string;
    index: number;
    movie?: Movie;
    aiRec?: { genre?: string; reason?: string };
}

const GptMovieCard: React.FC<GptMovieCardProps> = ({ movieName, index, movie, aiRec }) => {
    const dispatch = useDispatch();
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;
    const watchlist = useSelector((state: RootState) => state.watchlist.items);
    const [imgError, setImgError] = useState(false);

    const matchedMovie = movie || {
        id: index + 1000,
        title: movieName,
        overview: "A featured film recommended by Gemini AI.",
        poster_path: null,
        backdrop_path: null,
        vote_average: 8.2,
        vote_count: 5000,
        popularity: 90,
    };

    const displayTitle = matchedMovie.title || movieName;
    const isInWatchlist = watchlist.some((item) => item.id === matchedMovie.id);

    const posterSrc = getMediaImageUrl(matchedMovie.poster_path || matchedMovie.backdrop_path);


    const releaseYear = matchedMovie.release_date
        ? new Date(matchedMovie.release_date).getFullYear()
        : null;

    const handlePlay = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const trailer = await getMovieTrailer(matchedMovie.id);
        if (trailer?.key) {
            dispatch(
                openVideoModal({
                    trailerKey: trailer.key,
                    title: displayTitle,
                })
            );
        } else {
            const details = await getMovieDetails(matchedMovie.id);
            dispatch(setSelectedMovie(details || (matchedMovie as any)));
        }
    };

    const handleDetails = async () => {
        const details = await getMovieDetails(matchedMovie.id);
        dispatch(setSelectedMovie(details || (matchedMovie as any)));
    };

    const handleWatchlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isInWatchlist) {
            dispatch(removeFromWatchlist(matchedMovie.id));
            dispatch(showToast({ message: lang.removedFromWatchlist, type: "info" }));
        } else {
            dispatch(addToWatchlist(matchedMovie));
            dispatch(showToast({ message: lang.addedToWatchlist, type: "success" }));
        }
    };

    return (
        <div
            onClick={handleDetails}
            className="group relative bg-[#181818]/90 hover:bg-[#202020] border border-white/10 hover:border-red-600/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-950/30 transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 space-y-4"
        >
            {/* Top Card Section: Poster + Main Info */}
            <div className="flex gap-4">
                {/* Poster Thumbnail or Clean Fallback */}
                <div className="relative flex-none w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 shadow-md border border-white/10 group-hover:scale-105 transition-transform duration-300">
                    {!imgError && posterSrc ? (
                        <img
                            src={posterSrc}
                            alt={displayTitle}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-[#1c1c1c] to-black flex flex-col items-center justify-center p-2 text-center">
                            <Film className="w-6 h-6 text-red-600/70 mb-1" />
                            <span className="text-[10px] font-bold text-gray-300 line-clamp-2">
                                {displayTitle}
                            </span>
                        </div>
                    )}

                    <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>{matchedMovie.vote_average ? matchedMovie.vote_average.toFixed(1) : "8.0"}</span>
                    </div>
                </div>

                {/* Info Text */}
                <div className="flex-grow space-y-1.5 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-500 font-bold text-[10px] flex items-center justify-center border border-red-500/30 shrink-0">
                            {index + 1}
                        </span>
                        <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-red-500 transition-colors truncate">
                            {displayTitle}
                        </h3>
                    </div>

                    {aiRec?.genre && (
                        <span className="inline-block bg-white/5 text-gray-300 border border-white/10 text-[11px] font-medium px-2 py-0.5 rounded-md">
                            {aiRec.genre}
                        </span>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-400 pt-0.5">
                        {releaseYear && <span>{releaseYear}</span>}
                        <span>•</span>
                        <span className="text-green-400 font-semibold">98% {lang.matchScore}</span>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 pt-1 leading-relaxed">
                        {matchedMovie.overview}
                    </p>
                </div>
            </div>

            {/* AI Reasoning Quote Banner */}
            {aiRec?.reason && (
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-gray-300 italic flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">"{aiRec.reason}"</span>
                </div>
            )}

            {/* Action Buttons Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
                <button
                    onClick={handlePlay}
                    className="flex items-center gap-1.5 bg-white text-black hover:bg-red-600 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
                >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {lang.play}
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleWatchlist}
                        className={`p-2 rounded-lg border text-xs transition-colors ${
                            isInWatchlist
                                ? "bg-red-600 border-red-600 text-white"
                                : "border-white/20 bg-black/40 text-gray-300 hover:border-white hover:text-white"
                        }`}
                        title={isInWatchlist ? lang.removedFromWatchlist : lang.addedToWatchlist}
                    >
                        {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>

                    <button
                        onClick={handleDetails}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <Info className="w-3.5 h-3.5" />
                        <span>{lang.moreInfo}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GptMovieSuggestion: React.FC = () => {
    const { movieNames, movieResults, aiRecommendations, isLoading, error } =
    useSelector((state: RootState) => state.gpt);
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 py-12">
                <div className="flex items-center gap-3 justify-center mb-8 text-gray-300">
                    <Sparkles className="w-5 h-5 text-red-500 animate-spin" />
                    <span className="font-medium text-sm sm:text-base">{lang.aiThinking}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-2xl mx-auto px-4 py-10 text-center">
                <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-6 text-red-300 flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <p className="font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    if (!movieNames || movieNames.length === 0 || !movieResults) {
        return null;
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-8">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                    <Sparkles className="w-6 h-6 text-red-500" />
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {lang.recommendationsForYou}
                    </h2>
                </div>
                <span className="text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {movieNames.length} AI Recommendations
                </span>
            </div>

            {/* Grid of AI Recommended Movie Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movieNames.map((movieName, index) => (
                    <GptMovieCard
                        key={`${movieName}-${index}`}
                        movieName={movieName}
                        index={index}
                        movie={movieResults[index]?.[0]}
                        aiRec={aiRecommendations?.[index]}
                    />
                ))}
            </div>
        </div>
    );
};
