import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { closeModal, openVideoModal } from "../../features/movieSlice";
import { addToWatchlist, removeFromWatchlist } from "../../features/watchlistSlice";
import { showToast } from "../../features/configSlice";
import { language } from "../../utils/languageConstant";
import { IMG_CDN_URL_ORIGINAL, IMG_CDN_URL } from "../../utils/constant";
import { getMovieTrailer, getWatchProviders, getMovieCredits } from "../../services/movieService";

import { WatchProvider, CastMember } from "../../types/movie.types";
import { ProviderIcon } from "../common/ProviderIcon";
import { X, Play, Plus, Check, Star, Clock, Calendar, Tv, Film } from "lucide-react";

interface CastItemProps {
    name: string;
    character: string;
    profilePath?: string | null;
}

const CastMemberCard: React.FC<CastItemProps> = ({ name, character, profilePath }) => {
    const [hasError, setHasError] = useState(false);

    return (
        <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            {!hasError && profilePath ? (
                <img
                    src={profilePath.startsWith("http") ? profilePath : `${IMG_CDN_URL}${profilePath}`}
                    alt={name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-700/50 via-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-inner">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                </div>
            )}
            <div className="overflow-hidden min-w-0">
                <p className="text-xs font-semibold text-white truncate">{name}</p>
                <p className="text-[10px] text-gray-400 truncate">{character}</p>
            </div>
        </div>
    );
};

export const MovieDetailsModal: React.FC = () => {
    const dispatch = useDispatch();
    const { selectedMovie, isModalOpen } = useSelector((state: RootState) => state.movies);
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;
    const watchlist = useSelector((state: RootState) => state.watchlist.items);

    const [providers, setProviders] = useState<WatchProvider[]>([]);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [cast, setCast] = useState<CastMember[]>([]);
    const [imageIndex, setImageIndex] = useState(0);
    const [prevMovieId, setPrevMovieId] = useState<number | null>(null);

    if (selectedMovie && selectedMovie.id !== prevMovieId) {
        setPrevMovieId(selectedMovie.id);
        setImageIndex(0);
    }

    const isInWatchlist = selectedMovie
        ? watchlist.some((item) => item.id === selectedMovie.id)
        : false;

    useEffect(() => {
        const fetchExtraDetails = async () => {
            if (selectedMovie) {
                console.info(
                    `[MovieDetailsModal] 🎬 Fetching full metadata for "${selectedMovie.title || selectedMovie.name}" (ID: ${selectedMovie.id})`
                );
                const movieTitle = selectedMovie.title || selectedMovie.name;
                const [trailer, provs, fetchedCast] = await Promise.all([
                    getMovieTrailer(selectedMovie.id, movieTitle),
                    getWatchProviders(selectedMovie.id, movieTitle),
                    getMovieCredits(selectedMovie.id, movieTitle),
                ]);


                console.info(
                    `[MovieDetailsModal] 🌟 Setting top cast (${fetchedCast.length} members):`,
                    fetchedCast.map((c) => `${c.name} (${c.character})`)
                );
                setTrailerKey(trailer?.key || null);
                setProviders(provs);
                setCast(fetchedCast);

            }
        };

        if (selectedMovie) {
            fetchExtraDetails();
        }
    }, [selectedMovie]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                dispatch(closeModal());
            }
        };
        if (isModalOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isModalOpen, dispatch]);

    if (!isModalOpen || !selectedMovie) return null;

    // Multi-tier image fallback cascade (16:9 Backdrop -> HD Trailer Thumb -> Normal Poster)
    const candidateImages: { url: string; isPoster: boolean }[] = [];

    const formatImg = (p?: string | null, size = "original") => {
        if (!p) return null;
        if (p.startsWith("http://") || p.startsWith("https://")) return p;
        const clean = p.startsWith("/") ? p : `/${p}`;
        return size === "original"
            ? `${IMG_CDN_URL_ORIGINAL}${clean}`
            : `https://image.tmdb.org/t/p/${size}${clean}`;
    };

    // 1. First priority: 16:9 Landscape Backdrops
    if (selectedMovie.backdrop_path && selectedMovie.backdrop_path !== selectedMovie.poster_path) {
        candidateImages.push({ url: formatImg(selectedMovie.backdrop_path, "original")!, isPoster: false });
    }

    // Official 16:9 HD Trailer Thumbnails (Widescreen cinematic backdrop)
    const activeTrailerKey = trailerKey || selectedMovie.videos?.results?.[0]?.key;
    if (activeTrailerKey) {
        candidateImages.push({ url: `https://i.ytimg.com/vi/${activeTrailerKey}/maxresdefault.jpg`, isPoster: false });
        candidateImages.push({ url: `https://i.ytimg.com/vi/${activeTrailerKey}/hqdefault.jpg`, isPoster: false });
    }

    // 2. Second priority / Fallback: Normal Vertical Poster
    if (selectedMovie.poster_path) {
        candidateImages.push({ url: formatImg(selectedMovie.poster_path, "original")!, isPoster: true });
    }
    if (selectedMovie.backdrop_path && selectedMovie.backdrop_path === selectedMovie.poster_path && candidateImages.length === 0) {
        candidateImages.push({ url: formatImg(selectedMovie.backdrop_path, "original")!, isPoster: true });
    }

    const currentHero = candidateImages[imageIndex] || null;

    const handleImageError = () => {
        if (imageIndex < candidateImages.length - 1) {
            setImageIndex((prev) => prev + 1);
        }
    };

    const releaseYear = selectedMovie.release_date
        ? new Date(selectedMovie.release_date).getFullYear()
        : selectedMovie.first_air_date
            ? new Date(selectedMovie.first_air_date).getFullYear()
            : null;

    const runtimeFormatted = selectedMovie.runtime
        ? `${Math.floor(selectedMovie.runtime / 60)}h ${selectedMovie.runtime % 60}m`
        : null;

    const matchScore = Math.min(
        99,
        Math.max(70, Math.round((selectedMovie.vote_average || 7.5) * 10) + 4)
    );

    const handlePlayTrailer = () => {
        const keyToPlay = trailerKey || "zSWdZVtXT7E";
        dispatch(
            openVideoModal({
                trailerKey: keyToPlay,
                title: selectedMovie.title || selectedMovie.name || "Trailer",
            })
        );
    };

    const handleWatchlistToggle = () => {
        if (isInWatchlist) {
            dispatch(removeFromWatchlist(selectedMovie.id));
            dispatch(showToast({ message: lang.removedFromWatchlist, type: "info" }));
        } else {
            dispatch(addToWatchlist(selectedMovie));
            dispatch(showToast({ message: lang.addedToWatchlist, type: "success" }));
        }
    };

    // Prioritize dynamically fetched cast or selectedMovie.credits
    const displayCast = cast.length > 0
        ? cast.slice(0, 4)
        : selectedMovie.credits?.cast && selectedMovie.credits.cast.length > 0
            ? selectedMovie.credits.cast.slice(0, 4)
            : [];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            {/* Viewport Centering Wrapper */}
            <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 md:p-6">
                {/* Click outside backdrop */}
                <div
                    className="fixed inset-0 cursor-pointer"
                    onClick={() => dispatch(closeModal())}
                />

                {/* Compact Centered Modal Card */}
                <div className="relative w-full max-w-2xl lg:max-w-3xl bg-[#181818] rounded-2xl overflow-hidden shadow-2xl shadow-black border border-white/10 z-10 my-auto text-white animate-in zoom-in-95 duration-200">
                    {/* Close Button */}
                    <button
                        onClick={() => dispatch(closeModal())}
                        className="absolute top-3 right-3 z-40 p-1.5 rounded-full bg-black/75 hover:bg-white hover:text-black text-white transition-all duration-200 border border-white/20 shadow-lg backdrop-blur-md"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Hero Backdrop Banner */}
                    <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[260px] sm:max-h-[290px] w-full bg-[#141414] overflow-hidden flex items-center justify-center">
                        {currentHero ? (
                            <>
                                {/* Ambient Blurred Background */}
                                <img
                                    src={currentHero.url}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-35"
                                />

                                {/* Main Sharp Image */}
                                <img
                                    src={currentHero.url}
                                    alt={selectedMovie.title || selectedMovie.name || "Hero Banner"}
                                    className={`relative z-10 ${currentHero.isPoster
                                            ? "h-full max-h-[250px] object-contain shadow-2xl rounded-lg py-1.5 mx-auto"
                                            : "w-full h-full object-cover"
                                        }`}
                                    onError={handleImageError}
                                />
                            </>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-[#1a1a1a] to-black flex items-center justify-center">
                                <Film className="w-12 h-12 text-zinc-700/60" />
                            </div>
                        )}

                        {/* Banner Gradients */}
                        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Content Body */}
                    <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                        {/* Title, Tagline & Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                                    {selectedMovie.title || selectedMovie.name}
                                </h2>
                                {selectedMovie.tagline && (
                                    <p className="text-gray-400 italic text-xs sm:text-sm mt-0.5">
                                        "{selectedMovie.tagline}"
                                    </p>
                                )}
                            </div>

                            {/* Primary Action Buttons (Always 100% visible and interactive) */}
                            <div className="flex items-center gap-2.5 shrink-0">
                                <button
                                    onClick={handlePlayTrailer}
                                    className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    {lang.play}
                                </button>

                                <button
                                    onClick={handleWatchlistToggle}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm border transition-all active:scale-95 ${isInWatchlist
                                            ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-900/40"
                                            : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                                        }`}
                                >
                                    {isInWatchlist ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-white" />
                                            {lang.myList}
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5" />
                                            {lang.myList}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-gray-300">
                            <span className="text-green-400 font-bold text-xs sm:text-sm">
                                {matchScore}% {lang.matchScore}
                            </span>

                            {releaseYear && (
                                <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 text-[11px]">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    {releaseYear}
                                </span>
                            )}

                            {runtimeFormatted && (
                                <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 text-[11px]">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    {runtimeFormatted}
                                </span>
                            )}

                            <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/10 text-amber-400 font-semibold text-[11px]">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {selectedMovie.vote_average ? selectedMovie.vote_average.toFixed(1) : "8.0"} / 10
                            </span>

                            <span className="border border-white/20 text-gray-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                Ultra HD 4K
                            </span>
                        </div>

                        {/* Overview Synopsis */}
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                            {selectedMovie.overview}
                        </p>

                        {/* Genres & Available On Side-by-Side */}
                        {((selectedMovie.genres && selectedMovie.genres.length > 0) ||
                            (providers && providers.length > 0)) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/10">
                                    {/* Genres */}
                                    {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                                        <div>
                                            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                                                {lang.genres}
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedMovie.genres.map((g) => (
                                                    <span
                                                        key={g.id}
                                                        className="bg-white/10 text-white text-[11px] px-2.5 py-0.5 rounded-full border border-white/10"
                                                    >
                                                        {g.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Streaming Providers Beside Genres */}
                                    {providers && providers.length > 0 && (
                                        <div>
                                            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
                                                <Tv className="w-3.5 h-3.5 text-red-500" />
                                                {lang.whereToWatch}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {providers.map((prov) => {
                                                    const label = prov.provider_name === "Amazon Prime Video"
                                                        ? "Prime Video"
                                                        : prov.provider_name;

                                                    return (
                                                        <div
                                                            key={prov.provider_id}
                                                            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/15 shadow-sm transition-colors"
                                                        >
                                                            <ProviderIcon
                                                                providerName={prov.provider_name}
                                                                logoPath={prov.logo_path}
                                                                className="w-5 h-5"
                                                            />
                                                            <span className="text-xs font-semibold text-white">
                                                                {label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* Top Cast Row */}
                        {displayCast.length > 0 && (
                            <div className="pt-1 border-t border-white/10">
                                <h4 className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                                    {lang.cast}
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                    {displayCast.map((c) => (
                                        <CastMemberCard
                                            key={c.id}
                                            name={c.name}
                                            character={c.character}
                                            profilePath={c.profile_path}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
