import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import useTrailerVideo from "../../hooks/useTrailerVideo";

interface MovieBannerTrailerProps {
    movieId?: number;
}

export const MovieBannerTrailer: React.FC<MovieBannerTrailerProps> = ({ movieId }) => {
    const trailer = useSelector((state: RootState) => state.movies.trailerVideo);
    const isMuted = useSelector((state: RootState) => state.config.isMuted);

    useTrailerVideo(movieId);

    const trailerKey = trailer?.key || "zSWdZVtXT7E"; // Default Interstellar HD Trailer

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <iframe
                className="absolute top-1/2 left-1/2 w-[160vw] h-[160vh] min-w-[1000px] min-h-[562px] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none select-none scale-125 sm:scale-105"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${
                    isMuted ? "1" : "0"
                }&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&modestbranding=1&enablejsapi=1`}
                title="Hero Trailer Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />

            {/* Cinematic Gradient Overlays for Readability & Seamless Row Transition */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 sm:via-[#141414]/40 to-transparent w-full md:w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#141414]/80 via-transparent to-transparent h-32" />
        </div>
    );
};
