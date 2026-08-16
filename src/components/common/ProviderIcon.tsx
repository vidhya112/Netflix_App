import React, { useState } from "react";
import { Tv } from "lucide-react";
import netflixSvg from "../../assets/providers/netflix.svg";
import appletvSvg from "../../assets/providers/appletv.svg";
import disneySvg from "../../assets/providers/disney.svg";
import primeSvg from "../../assets/providers/prime.svg";
import hboSvg from "../../assets/providers/hbo.svg";

interface ProviderIconProps {
    providerName: string;
    logoPath?: string;
    className?: string;
}

export const ProviderIcon: React.FC<ProviderIconProps> = ({
    providerName,
    logoPath,
    className = "w-5 h-5",
}) => {
    const [imageError, setImageError] = useState(false);
    const name = providerName.toLowerCase();
    const logoLower = (logoPath || "").toLowerCase();

    // Map to bundled vector SVGs for top streaming platforms
    let imageSrc: string | undefined = undefined;

    if (name.includes("netflix") || logoLower.includes("netflix")) {
        imageSrc = netflixSvg;
    } else if (name.includes("apple") || logoLower.includes("appletv") || logoLower.includes("apple")) {
        imageSrc = appletvSvg;
    } else if (name.includes("disney") || logoLower.includes("disney")) {
        imageSrc = disneySvg;
    } else if (name.includes("prime") || name.includes("amazon") || logoLower.includes("prime")) {
        imageSrc = primeSvg;
    } else if (name.includes("hbo") || name.includes("max") || logoLower.includes("hbo")) {
        imageSrc = hboSvg;
    } else if (logoPath) {
        imageSrc = (logoPath.startsWith("http://") || logoPath.startsWith("https://") || logoPath.startsWith("data:"))
            ? logoPath
            : `https://image.tmdb.org/t/p/w200${logoPath.startsWith("/") ? logoPath : `/${logoPath}`}`;
    }

    if (imageSrc && !imageError) {
        return (
            <img
                src={imageSrc}
                alt={providerName}
                onError={() => setImageError(true)}
                className={`${className} rounded-md object-contain shrink-0`}
            />
        );
    }

    // High-visibility fallback vector badges
    if (name.includes("disney")) {
        return (
            <div
                className={`${className} rounded-md bg-[#113ccf] flex items-center justify-center p-0.5 shadow-sm shrink-0`}
                title="Disney+"
            >
                <span className="text-[10px] font-black text-white">D+</span>
            </div>
        );
    }

    if (name.includes("netflix")) {
        return (
            <div
                className={`${className} rounded-md bg-black border border-red-600 flex items-center justify-center p-0.5 shadow-sm shrink-0`}
                title="Netflix"
            >
                <span className="text-xs font-black text-red-600">N</span>
            </div>
        );
    }

    if (name.includes("apple")) {
        return (
            <div
                className={`${className} rounded-md bg-black border border-white/30 flex items-center justify-center p-0.5 shadow-sm shrink-0`}
                title="Apple TV+"
            >
                <span className="text-[10px] font-bold text-white tracking-tighter">tv</span>
            </div>
        );
    }

    if (name.includes("hbo") || name.includes("max")) {
        return (
            <div
                className={`${className} rounded-md bg-gradient-to-r from-[#34229b] to-[#875bb0] flex items-center justify-center p-0.5 shadow-sm shrink-0`}
                title="HBO Max"
            >
                <span className="text-[9px] font-black text-white">MAX</span>
            </div>
        );
    }

    if (name.includes("prime") || name.includes("amazon")) {
        return (
            <div
                className={`${className} rounded-md bg-[#00A8E1] flex items-center justify-center p-0.5 shadow-sm shrink-0`}
                title="Prime Video"
            >
                <span className="text-[9px] font-black text-black">prime</span>
            </div>
        );
    }

    return (
        <div
            className={`${className} rounded-md bg-white/10 border border-white/20 flex items-center justify-center p-0.5 shadow-sm shrink-0`}
            title={providerName}
        >
            <Tv className="w-3.5 h-3.5 text-gray-300" />
        </div>
    );
};

export default ProviderIcon;
