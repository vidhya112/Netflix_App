import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import {
    setGptLoading,
    setGptError,
    setSearchQuery,
    addGptSearchMovies,
} from "../../features/gptSlice";
import { getGeminiMovieRecommendations } from "../../services/geminiService";
import { searchMovies } from "../../services/movieService";
import { language } from "../../utils/languageConstant";
import { GEMINI_PROMPT_SUGGESTIONS } from "../../utils/constant";
import { Search, Sparkles, Loader2 } from "lucide-react";

export const GptSearchBar: React.FC = () => {
    const dispatch = useDispatch();
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;
    const { isLoading, searchQuery } = useSelector((state: RootState) => state.gpt);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const executeSearch = async (queryText: string) => {
        if (!queryText.trim()) return;

        dispatch(setGptLoading(true));
        dispatch(setSearchQuery(queryText));

        try {
            console.info(`[GPT Search] 🔍 User initiated AI movie search for: "${queryText}"`);
            // 1. Get AI recommendations from Google Gemini
            const { recommendations, titles } = await getGeminiMovieRecommendations(queryText);
            console.info(`[GPT Search] 🤖 AI suggested ${titles.length} movies:`, titles);

            // 2. Fetch metadata for each movie recommendation in parallel
            console.info(`[GPT Search] 🎬 Resolving movie cards for all ${titles.length} titles in parallel...`);
            const moviePromises = titles.map((title) => searchMovies(title));
            const resolvedResults = await Promise.all(moviePromises);
            console.info(`[GPT Search] ✅ Successfully resolved movie cards for ${resolvedResults.length} recommendations`);


            dispatch(
                addGptSearchMovies({
                    movieNames: titles,
                    movieResults: resolvedResults,
                    aiRecommendations: recommendations,
                })
            );
        } catch (err: any) {
            console.warn('[GPT Search] ❌ Error during AI movie search:', err);
            dispatch(setGptError(err.message || "Failed to fetch movie recommendations"));
        }

    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInputRef.current) {
            executeSearch(searchInputRef.current.value);
        }
    };

    const handleChipClick = (suggestion: string) => {
        if (searchInputRef.current) {
            searchInputRef.current.value = suggestion;
        }
        executeSearch(suggestion);
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pt-28 sm:pt-36">
            {/* AI Header Badge */}
            <div className="text-center mb-6 space-y-2">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-gray-200 shadow-lg">
                    <Sparkles className="w-4 h-4 text-red-500 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Powered by Google Gemini AI + TVMaze & OMDb</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xl">
                    {lang.gptSearch}
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
          Describe the vibe, plot, or actors you're in the mood for. Let AI curate your next watch.
                </p>
            </div>

            {/* Main Search Input Form */}
            <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl shadow-black/80 focus-within:border-red-600/60 focus-within:ring-2 focus-within:ring-red-600/20 transition-all"
            >
                <div className="pl-4 text-gray-400">
                    <Search className="w-5 h-5" />
                </div>

                <input
                    ref={searchInputRef}
                    type="text"
                    defaultValue={searchQuery}
                    placeholder={lang.getSearchPlaceholder}
                    className="w-full bg-transparent px-4 py-3 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none"
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold px-5 py-3 rounded-xl transition-all duration-200 shrink-0 shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="hidden sm:inline">Searching...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>{lang.search}</span>
                        </>
                    )}
                </button>
            </form>

            {/* Suggested Prompt Chips */}
            <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {lang.tryThese}
                </p>
                <div className="flex flex-wrap gap-2">
                    {GEMINI_PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleChipClick(suggestion)}
                            className="text-xs text-gray-300 bg-white/5 hover:bg-white/15 hover:text-white px-3.5 py-1.5 rounded-full border border-white/10 transition-all hover:scale-105 active:scale-95 text-left"
                        >
              "{suggestion}"
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
