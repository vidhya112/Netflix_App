import React from "react";
import { GptSearchBar } from "./GptSearchBar";
import { GptMovieSuggestion } from "./GptMovieSuggestion";
import { BACKGROUND_IMAGE } from "../../utils/constant";

export const GptSearch: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-[#141414] overflow-hidden pb-20">
            {/* Ambient background collage with overlay */}
            <div className="fixed inset-0 pointer-events-none select-none z-0">
                <img
                    src={BACKGROUND_IMAGE}
                    alt="Netflix Background"
                    className="w-full h-full object-cover opacity-15 scale-105 filter blur-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-[#141414]/60" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
            </div>

            <div className="relative z-10">
                <GptSearchBar />
                <GptMovieSuggestion />
            </div>
        </div>
    );
};

export default GptSearch;
