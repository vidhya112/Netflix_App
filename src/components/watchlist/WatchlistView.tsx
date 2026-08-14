import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { MovieCard } from "../common/MovieCard";
import { clearWatchlist } from "../../features/watchlistSlice";
import { setGptSearchView } from "../../features/gptSlice";
import { language } from "../../utils/languageConstant";
import { BookmarkCheck, Trash2, Sparkles } from "lucide-react";

export const WatchlistView: React.FC = () => {
    const dispatch = useDispatch();
    const watchlist = useSelector((state: RootState) => state.watchlist.items);
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;

    return (
        <div className="min-h-screen bg-[#141414] text-white px-6 md:px-14 pt-28 pb-20">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
                        <BookmarkCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black">{lang.myList}</h1>
                        <p className="text-gray-400 text-xs sm:text-sm">
                            {watchlist.length} {watchlist.length === 1 ? "title" : "titles"} saved for later
                        </p>
                    </div>
                </div>

                {watchlist.length > 0 && (
                    <button
                        onClick={() => dispatch(clearWatchlist())}
                        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-400 hover:text-red-500 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
            Clear List
                    </button>
                )}
            </div>

            {/* Grid or Empty State */}
            {watchlist.length === 0 ? (
                <div className="max-w-md mx-auto py-16 text-center space-y-5">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-400">
                        <BookmarkCheck className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {lang.watchlistEmpty}
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                        <button
                            onClick={() => dispatch(setGptSearchView(true))}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-red-600/30"
                        >
                            <Sparkles className="w-4 h-4" />
              Explore with AI
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {watchlist.map((movie) => (
                        <div key={movie.id} className="flex justify-center">
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchlistView;
