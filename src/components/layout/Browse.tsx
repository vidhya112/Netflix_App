import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MovieBanner } from "../homePage/MovieBanner";
import { MovieCategory } from "../homePage/MovieCategory";
import { GptSearch } from "../gptSearchPage/GptSearch";
import { WatchlistView } from "../watchlist/WatchlistView";
import { MovieDetailsModal } from "../modal/MovieDetailsModal";
import { VideoModal } from "../common/VideoModal";
import { Toast } from "../common/Toast";

import useNowPlayingMovies from "../../hooks/useNowPlayingMovies";
import usePopularMovies from "../../hooks/usePopularMovies";
import useTopRatedMovies from "../../hooks/useTopRatedMovies";
import useUpcomingMovies from "../../hooks/useUpcomingMovies";
import useTrendingMovies from "../../hooks/useTrendingMovies";

export const Browse: React.FC = () => {
    const showGptSearch = useSelector((state: RootState) => state.gpt.showGptSearch);
    const activeNavTab = useSelector((state: RootState) => state.config.activeNavTab);

    // Initialize movie rows data
    useNowPlayingMovies();
    usePopularMovies();
    useTopRatedMovies();
    useUpcomingMovies();
    useTrendingMovies();

    return (
        <div className="min-h-screen bg-[#141414] text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
            <Header />

            <main className="flex-grow pb-16 md:pb-0">
                {showGptSearch ? (
                    <GptSearch />
                ) : activeNavTab === "watchlist" ? (
                    <WatchlistView />
                ) : (
                    <>
                        <MovieBanner />
                        <MovieCategory />
                    </>
                )}
            </main>

            {/* Global Modals & Notifications */}
            <MovieDetailsModal />
            <VideoModal />
            <Toast />

            <Footer />
        </div>
    );
};

export default Browse;
