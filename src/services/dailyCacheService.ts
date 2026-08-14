import { Movie } from '../types/movie.types';
import { fetchOMDBMovie, convertOMDBToMovie } from './omdbService';
import { fetchAllTVMazeShows, convertTVMazeShowToMovie } from './tvmazeService';

const CACHE_PREFIX = 'netflix_daily_cache_';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachePayload<T> {
    timestamp: number;
    data: T;
}

export const getDailyCache = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (!item) return null;

        const parsed: CachePayload<T> = JSON.parse(item);
        const age = Date.now() - parsed.timestamp;

        if (age < ONE_DAY_MS && parsed.data) {
            const hoursLeft = Math.round((ONE_DAY_MS - age) / (1000 * 60 * 60));
            console.info(`[Daily Cache] ⚡ Loaded "${key}" from browser cache (valid for ${hoursLeft}h)`);
            return parsed.data;
        } else {
            console.info(`[Daily Cache] ⌛ Cache expired for "${key}", refreshing live data for the day`);
            localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        }
    } catch (e) {
        console.warn(`[Daily Cache] ⚠️ Error reading cache for "${key}":`, e);
    }
    return null;
};

export const setDailyCache = <T>(key: string, data: T): void => {
    try {
        const payload: CachePayload<T> = {
            timestamp: Date.now(),
            data,
        };
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
        console.info(`[Daily Cache] 💾 Saved fresh data for "${key}" in browser cache (expires in 24 hours)`);
    } catch (e) {
        console.warn(`[Daily Cache] ⚠️ Error saving cache for "${key}":`, e);
    }
};

const CATEGORY_SEEDS: Record<string, string[]> = {
    now_playing: [
        "Interstellar",
        "Inception",
        "The Matrix",
        "Arrival",
        "Blade Runner 2049",
        "The Dark Knight",
        "Avengers: Endgame",
        "Parasite",
    ],
    popular: [
        "Oppenheimer",
        "Spirited Away",
        "Coco",
        "Knives Out",
        "Superbad",
        "Shutter Island",
        "Gone Girl",
        "Se7en",
    ],
    top_rated: [
        "The Dark Knight",
        "Interstellar",
        "Parasite",
        "Spirited Away",
        "Inception",
        "Se7en",
        "Spider-Man: Across the Spider-Verse",
        "Coco",
    ],
    upcoming: [
        "WALL-E",
        "Spider-Man: Across the Spider-Verse",
        "3 Idiots",
        "The Grand Budapest Hotel",
        "Arrival",
        "Blade Runner 2049",
        "Oppenheimer",
        "Knives Out",
    ],
    trending: [
        "Interstellar",
        "Inception",
        "The Matrix",
        "Arrival",
        "The Dark Knight",
        "Avengers: Endgame",
        "Parasite",
        "Oppenheimer",
        "Coco",
        "Knives Out",
    ],
};

export const fetchLiveDailyCollection = async (
    categoryKey: 'now_playing' | 'popular' | 'top_rated' | 'upcoming' | 'trending'
): Promise<Movie[]> => {
    // 1. Check 24-hour browser cache first
    const cached = getDailyCache<Movie[]>(categoryKey);
    if (cached && cached.length > 0) {
        return cached;
    }

    console.info(`[Daily Engine] 🚀 Fetching fresh live daily collection for "${categoryKey}" via OMDb + TVMaze...`);

    const titles = CATEGORY_SEEDS[categoryKey] || CATEGORY_SEEDS.now_playing;

    try {
        // Fetch movie seeds in parallel via live OMDb API
        const omdbPromises = titles.map(async (title) => {
            const omdb = await fetchOMDBMovie(title, 'full');
            if (omdb && omdb.Response !== 'False' && omdb.Poster && omdb.Poster !== 'N/A') {
                return convertOMDBToMovie(omdb);
            }
            return null;
        });

        const omdbResults = await Promise.all(omdbPromises);
        let validMovies = omdbResults.filter(Boolean) as Movie[];

        // Fallback / augmentation with TVMaze shows if needed
        if (validMovies.length < 5) {
            const tvShows = await fetchAllTVMazeShows();
            if (tvShows && tvShows.length > 0) {
                const tvMovies = tvShows.slice(0, 10).map(convertTVMazeShowToMovie);
                validMovies = [...validMovies, ...tvMovies];
            }
        }

        if (validMovies.length > 0) {
            setDailyCache(categoryKey, validMovies);
            console.info(`[Daily Engine] ✅ Cached ${validMovies.length} fresh live titles for "${categoryKey}"`);
            return validMovies;
        }
    } catch (err) {
        console.warn(`[Daily Engine] ⚠️ Error fetching daily collection for "${categoryKey}":`, err);
    }

    return [];
};
