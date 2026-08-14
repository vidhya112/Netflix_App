import React from "react";

export const SkeletonCard: React.FC = () => {
    return (
        <div className="flex-none w-36 sm:w-44 md:w-52 aspect-[2/3] rounded-lg bg-white/5 animate-pulse overflow-hidden relative border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
        </div>
    );
};

export const SkeletonRow: React.FC = () => {
    return (
        <div className="px-4 md:px-12 py-4">
            <div className="h-6 bg-white/10 rounded w-48 mb-4 animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
};
