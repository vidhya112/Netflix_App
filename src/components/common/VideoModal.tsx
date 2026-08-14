import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { closeVideoModal } from "../../features/movieSlice";
import { X, Volume2 } from "lucide-react";

export const VideoModal: React.FC = () => {
    const dispatch = useDispatch();
    const { isVideoModalOpen, playingTrailerKey, playingMovieTitle } = useSelector(
        (state: RootState) => state.movies
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                dispatch(closeVideoModal());
            }
        };
        if (isVideoModalOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isVideoModalOpen, dispatch]);

    if (!isVideoModalOpen || !playingTrailerKey) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Centering wrapper */}
            <div className="min-h-full flex items-center justify-center p-3 sm:p-6 md:p-10">
                {/* Backdrop click to close */}
                <div
                    className="fixed inset-0 cursor-pointer"
                    onClick={() => dispatch(closeVideoModal())}
                />

                <div className="relative w-full max-w-5xl bg-[#141414] rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10 flex flex-col my-8">
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-6 py-4 bg-[#181818] border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                            <h3 className="font-bold text-lg text-white truncate max-w-md">
                                {playingMovieTitle || "Trailer Player"}
                            </h3>
                        </div>
                        <button
                            onClick={() => dispatch(closeVideoModal())}
                            className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="Close Trailer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Video Player */}
                    <div className="relative aspect-video w-full bg-black">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${playingTrailerKey}?autoplay=1&rel=0&showinfo=0&modestbranding=1`}
                            title={playingMovieTitle || "Movie Trailer"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>

                    {/* Bottom Bar Info */}
                    <div className="px-6 py-3 bg-[#181818] flex items-center justify-between text-xs text-gray-400 border-t border-white/5">
                        <span className="flex items-center gap-1.5">
                            <Volume2 className="w-4 h-4 text-red-500" /> Cinema Sound Enabled (1080p Full HD)
                        </span>
                        <span>Press ESC or click Outside to Exit</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
