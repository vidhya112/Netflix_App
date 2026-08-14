import React, { useRef, useState } from "react";
import { Movie } from "../../types/movie.types";
import { MovieCard } from "../common/MovieCard";
import { SkeletonCard } from "../common/SkeletonCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MovieRowProps {
  title: string;
  movies: Movie[] | null;
  badge?: string;
}

export const MovieRow: React.FC<MovieRowProps> = ({ title, movies, badge }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    if (!movies) {
        return (
            <div className="relative py-3 md:py-5 px-4 md:px-14">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-36 sm:w-48 bg-white/10 rounded-md animate-pulse" />
                </div>
                <div className="flex items-center gap-3 sm:gap-4 md:gap-5 overflow-hidden py-3 px-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (movies.length === 0) return null;

    const handleScroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollAmount = clientWidth * 0.75;
            const targetScroll =
        direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

            rowRef.current.scrollTo({
                left: targetScroll,
                behavior: "smooth",
            });
        }
    };

    const onScrollCheck = () => {
        if (rowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            setShowLeftArrow(scrollLeft > 20);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
        }
    };

    return (
        <div className="relative group/row py-3 md:py-5 px-4 md:px-14">
            {/* Row Header */}
            <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight group-hover/row:text-red-500 transition-colors">
                    {title}
                </h2>
                {badge && (
                    <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {badge}
                    </span>
                )}
            </div>

            {/* Left Scroll Button */}
            {showLeftArrow && (
                <button
                    onClick={() => handleScroll("left")}
                    className="absolute left-2 top-[55%] -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/70 hover:bg-red-600 text-white backdrop-blur-md transition-all duration-200 border border-white/10 opacity-0 group-hover/row:opacity-100 shadow-xl hover:scale-110"
                    aria-label="Scroll Left"
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            )}

            {/* Movie Cards Container */}
            <div
                ref={rowRef}
                onScroll={onScrollCheck}
                className="flex items-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-none scroll-smooth py-3 px-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            {/* Right Scroll Button */}
            {showRightArrow && (
                <button
                    onClick={() => handleScroll("right")}
                    className="absolute right-2 top-[55%] -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/70 hover:bg-red-600 text-white backdrop-blur-md transition-all duration-200 border border-white/10 opacity-0 group-hover/row:opacity-100 shadow-xl hover:scale-110"
                    aria-label="Scroll Right"
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            )}
        </div>
    );
};
