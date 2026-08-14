export const LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg";

export const USER_AVATARS = [
    {
        id: "red",
        name: "Classic Red",
        url: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
    },
    {
        id: "blue",
        name: "Cyber Blue",
        url: "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=2563eb",
    },
    {
        id: "ruby",
        name: "Crimson Spark",
        url: "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka&backgroundColor=e11d48",
    },
    {
        id: "yellow",
        name: "Solar Gold",
        url: "https://api.dicebear.com/7.x/bottts/svg?seed=Milo&backgroundColor=eab308",
    },
    {
        id: "purple",
        name: "Neon Violet",
        url: "https://api.dicebear.com/7.x/bottts/svg?seed=Casper&backgroundColor=9333ea",
    },
];

export const USER_AVATAR = USER_AVATARS[0].url;


export const ROUTE = {
    BROWSE: "/browse",
    LOGIN: "/",
    WATCHLIST: "/watchlist",
    SEARCH: "/search",
};

export const IMG_CDN_URL = "https://image.tmdb.org/t/p/w500";
export const IMG_CDN_URL_ORIGINAL = "https://image.tmdb.org/t/p/original";
export const IMG_CDN_URL_SMALL = "https://image.tmdb.org/t/p/w300";

export const BACKGROUND_IMAGE =
  "https://assets.nflxext.com/ffe/siteui/vlv3/8200f588-2e93-4c95-8eab-ebba17821657/web/IN-en-20250616-TRIFECTA-perspective_9cbc87b2-d9bb-4fa8-9f8f-a4fe8fc72545_large.jpg";

export const SUPPORTED_LANGUAGES = [
    { identifier: "en", name: "English", flag: "🇺🇸" },
    { identifier: "hindi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { identifier: "spanish", name: "Español", flag: "🇪🇸" },
    { identifier: "french", name: "Français", flag: "🇫🇷" },
    { identifier: "german", name: "Deutsch", flag: "🇩🇪" },
    { identifier: "japanese", name: "日本語 (Japanese)", flag: "🇯🇵" },
];

export const GEMINI_PROMPT_SUGGESTIONS = [
    "Mind-bending sci-fi thrillers like Inception and Interstellar",
    "Feel-good animated movies with beautiful art style for a cozy night",
    "High stakes heist thrillers with clever plot twists",
    "Gripping suspense crime mystery series with unexpected endings",
    "Romantic comedy with enemies to lovers trope and great chemistry",
    "Epic historical action movies with massive battle scenes",
];

export const getMediaImageUrl = (path?: string | null, size: 'original' | 'w500' | 'w300' = 'w500'): string | null => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return size === 'original'
        ? `${IMG_CDN_URL_ORIGINAL}${clean}`
        : `${IMG_CDN_URL}${clean}`;
};

