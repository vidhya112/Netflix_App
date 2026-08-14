import { Movie, MovieDetails, CastMember, WatchProvider } from '../types/movie.types';

export interface TVMazeShow {
    id: number;
    name: string;
    type?: string;
    language?: string;
    genres: string[];
    status?: string;
    summary: string;
    weight?: number;
    rating?: { average?: number };
    image?: { medium?: string; original?: string };
    premiered?: string;
    officialSite?: string;
    network?: { name?: string };
    webChannel?: { name?: string };
}

export interface TVMazeCastItem {
    person: {
        id: number;
        name: string;
        image?: { medium?: string; original?: string };
    };
    character: {
        id: number;
        name: string;
        image?: { medium?: string; original?: string };
    };
}

export const convertTVMazeShowToMovie = (show: TVMazeShow): Movie => {
    const cleanSummary = (show.summary || "")
        .replace(/<[^>]*>?/gm, "")
        .trim();

    return {
        id: show.id,
        title: show.name,
        name: show.name,
        overview: cleanSummary || "An acclaimed show available for streaming.",
        poster_path: show.image?.original || show.image?.medium || null,
        backdrop_path: show.image?.original || show.image?.medium || null,
        release_date: show.premiered || "2022-01-01",
        vote_average: show.rating?.average || 8.2,
        vote_count: 8500,
        popularity: show.weight || 95,
        genre_ids: [18],
    };
};

let cachedShows: TVMazeShow[] | null = null;

export const fetchAllTVMazeShows = async (): Promise<TVMazeShow[]> => {
    if (cachedShows && cachedShows.length > 0) {
        return cachedShows;
    }

    try {
        console.info(`[TVMaze API] 🚀 GET https://api.tvmaze.com/shows?page=0 (Live show database)`);
        const res = await fetch("https://api.tvmaze.com/shows?page=0");
        if (!res.ok) return [];
        const data = (await res.json()) as TVMazeShow[];
        if (Array.isArray(data) && data.length > 0) {
            cachedShows = data;
            console.info(`[TVMaze API] ✅ Loaded ${data.length} live shows from TVMaze`);
            return data;
        }
    } catch (err) {
        console.warn("[TVMaze API] ❌ Error fetching shows:", err);
    }
    return [];
};

export const searchTVMaze = async (query: string): Promise<Movie[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
        console.info(`[TVMaze API] 🚀 GET https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`);
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`);

        if (!res.ok) return [];
        const data = (await res.json()) as { score: number; show: TVMazeShow }[];

        if (!Array.isArray(data) || data.length === 0) return [];

        return data.map((item) => convertTVMazeShowToMovie(item.show));
    } catch (err) {
        console.warn("[TVMaze API] ❌ Search fetch error:", err);
        return [];
    }
};

/**
 * Fetch official 16:9 widescreen 1920x1080 background images from TVMaze
 */
export const getTVMazeBackdrop = async (showId: number): Promise<string | null> => {
    try {
        const res = await fetch(`https://api.tvmaze.com/shows/${showId}/images`);
        if (!res.ok) return null;
        const images = await res.json();
        if (Array.isArray(images)) {
            const bg = images.find((i: any) => i.type === 'background');
            if (bg?.resolutions?.original?.url) {
                return bg.resolutions.original.url;
            }
        }
    } catch {
        return null;
    }
    return null;
};

export const getTVMazeCast = async (showId: number): Promise<CastMember[]> => {
    try {
        console.info(`[TVMaze API] 🎭 GET https://api.tvmaze.com/shows/${showId}/cast`);
        const res = await fetch(`https://api.tvmaze.com/shows/${showId}/cast`);

        if (!res.ok) return [];
        const data = (await res.json()) as TVMazeCastItem[];

        if (!Array.isArray(data) || data.length === 0) return [];

        return data.slice(0, 8).map((c, idx) => ({
            id: c.person.id || idx,
            name: c.person.name,
            character: c.character.name || "Main Role",
            profile_path: c.person.image?.medium || c.person.image?.original || null,
            order: idx,
        }));
    } catch (err) {
        console.warn("[TVMaze API] ❌ Cast fetch error:", err);
        return [];
    }
};

export const getTVMazeProviders = (show?: TVMazeShow): WatchProvider[] => {
    const channelName = show?.webChannel?.name || show?.network?.name || "";
    const lower = channelName.toLowerCase();

    if (lower.includes("netflix")) {
        return [{ provider_id: 8, provider_name: "Netflix", logo_path: "/providers/netflix.svg" }];
    }
    if (lower.includes("prime") || lower.includes("amazon")) {
        return [{ provider_id: 119, provider_name: "Prime Video", logo_path: "/providers/prime.svg" }];
    }
    if (lower.includes("apple")) {
        return [{ provider_id: 2, provider_name: "Apple TV+", logo_path: "/providers/appletv.svg" }];
    }
    if (lower.includes("hbo") || lower.includes("max")) {
        return [{ provider_id: 384, provider_name: "HBO Max", logo_path: "/providers/hbo.svg" }];
    }
    if (lower.includes("disney") || lower.includes("hulu")) {
        return [{ provider_id: 337, provider_name: "Disney+", logo_path: "/providers/disney.svg" }];
    }

    return [{ provider_id: 8, provider_name: "Netflix", logo_path: "/providers/netflix.svg" }];
};
