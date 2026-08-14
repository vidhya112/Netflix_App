import { Movie, MovieDetails, CastMember } from '../types/movie.types';

export interface OMDBMovie {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: { Source: string; Value: string }[];
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    Response: string;
    Error?: string;
}

export interface OMDBSearchResponse {
    Search?: {
        Title: string;
        Year: string;
        imdbID: string;
        Type: string;
        Poster: string;
    }[];
    totalResults?: string;
    Response: string;
    Error?: string;
}

// Track if OMDb key is valid to avoid redundant network 401s
let isOmdbAvailable = true;

const getOMDBApiKey = (): string => {
    return import.meta.env.VITE_OMDB_API_KEY || "a8cb809d";
};

/**
 * Fetch movie details by Title (e.g. ?t=Oppenheimer&apikey=...&plot=full)
 */
export const fetchOMDBMovie = async (title: string, plot: 'short' | 'full' = 'full'): Promise<OMDBMovie | null> => {
    const trimmed = title.trim();
    if (!trimmed || !isOmdbAvailable) return null;

    const apiKey = getOMDBApiKey();
    if (!apiKey) return null;

    try {
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(trimmed)}&plot=${plot}`;
        const res = await fetch(url);

        if (res.status === 401) {
            console.info(`[OMDb API] ℹ️ OMDb key returned 401. Using TVMaze + Gemini engine.`);
            isOmdbAvailable = false;
            return null;
        }

        if (!res.ok) return null;
        const data = (await res.json()) as OMDBMovie;

        if (data.Response === "False") {
            return null;
        }

        console.info(`[OMDb API] ✅ Retrieved verified data for "${data.Title}" (IMDb: ${data.imdbRating})`);
        return data;
    } catch {
        return null;
    }
};

/**
 * Fetch movie details by IMDb ID (e.g. ?i=tt15398776&apikey=...&plot=full)
 */
export const fetchOMDBMovieById = async (imdbId: string, plot: 'short' | 'full' = 'full'): Promise<OMDBMovie | null> => {
    const trimmed = imdbId.trim();
    if (!trimmed || !isOmdbAvailable) return null;

    const apiKey = getOMDBApiKey();
    if (!apiKey) return null;

    try {
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(trimmed)}&plot=${plot}`;
        const res = await fetch(url);

        if (res.status === 401) {
            isOmdbAvailable = false;
            return null;
        }

        if (!res.ok) return null;
        const data = (await res.json()) as OMDBMovie;

        if (data.Response === "False") return null;

        return data;
    } catch {
        return null;
    }
};

/**
 * Search movies by keyword (e.g. ?s=Batman&apikey=...)
 */
export const searchOMDB = async (query: string): Promise<Movie[]> => {
    const trimmed = query.trim();
    if (!trimmed || !isOmdbAvailable) return [];

    const apiKey = getOMDBApiKey();
    if (!apiKey) return [];


    try {
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url);

        if (res.status === 401) {
            isOmdbAvailable = false;
            return [];
        }

        if (!res.ok) return [];
        const data = (await res.json()) as OMDBSearchResponse;

        if (data.Response === "False" || !data.Search) return [];

        return data.Search.map((item, idx) => {
            const hashId = Math.abs(item.imdbID.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 1000000;
            return {
                id: hashId,
                title: item.Title,
                name: item.Title,
                overview: `Released in ${item.Year}. An IMDb recognized ${item.Type}.`,
                poster_path: item.Poster !== "N/A" ? item.Poster : null,
                backdrop_path: item.Poster !== "N/A" ? item.Poster : null,
                release_date: `${item.Year}-01-01`,
                vote_average: 8.0,
                vote_count: 5000,
                popularity: 100,
                genre_ids: [18],
            };
        });
    } catch {
        return [];
    }
};

export const parseOMDBCast = (actorsString?: string): CastMember[] => {
    if (!actorsString || actorsString.trim() === "N/A") return [];

    const actorNames = actorsString.split(",").map((a) => a.trim());
    return actorNames.map((name, idx) => ({
        id: 800000 + idx,
        name,
        character: idx === 0 ? "Lead Role" : "Co-Star",
        profile_path: null,
        order: idx,
    }));
};

export const convertOMDBToMovie = (omdb: OMDBMovie): MovieDetails => {
    const rating = parseFloat(omdb.imdbRating) || 8.0;
    const runtimeMinutes = parseInt(omdb.Runtime) || 120;
    const hashId = Math.abs(omdb.Title.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 1000000;

    const genresList = (omdb.Genre || "Drama, Sci-Fi")
        .split(",")
        .map((g, idx) => ({ id: idx + 1, name: g.trim() }));

    const castList = parseOMDBCast(omdb.Actors);

    return {
        id: hashId,
        title: omdb.Title,
        name: omdb.Title,
        overview: omdb.Plot !== "N/A" ? omdb.Plot : "An extraordinary cinematic masterpiece.",
        poster_path: omdb.Poster !== "N/A" ? omdb.Poster : null,
        backdrop_path: omdb.Poster !== "N/A" ? omdb.Poster : null,
        release_date: omdb.Released !== "N/A" ? omdb.Released : `${omdb.Year}-01-01`,
        vote_average: rating,
        vote_count: parseInt(omdb.imdbVotes?.replace(/,/g, "")) || 15000,
        popularity: 120,
        genre_ids: [18, 878],
        genres: genresList,
        runtime: runtimeMinutes,
        tagline: omdb.Awards !== "N/A" ? omdb.Awards : "An unforgettable story.",
        credits: { cast: castList },
    };
};
