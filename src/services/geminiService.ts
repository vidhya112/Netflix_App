import { GeminiMovieRecommendation } from '../types/gpt.types';

const FALLBACK_RECOMMENDATIONS: Record<string, GeminiMovieRecommendation[]> = {
    scifi: [
        { title: "Interstellar", genre: "Sci-Fi / Adventure", reason: "Epic journey through space-time tackling gravity, wormholes, and love." },
        { title: "Inception", genre: "Sci-Fi / Action", reason: "Mind-bending psychological heist inside nested dreamscapes." },
        { title: "The Matrix", genre: "Sci-Fi / Cyberpunk", reason: "Groundbreaking reality-questioning cyber action adventure." },
        { title: "Arrival", genre: "Sci-Fi / Drama", reason: "Fascinating exploration of alien linguistics, time perception, and humanity." },
        { title: "Blade Runner 2049", genre: "Sci-Fi / Mystery", reason: "Visually breathtaking noir detective quest across a dystopian future." },
    ],
    action: [
        { title: "The Dark Knight", genre: "Action / Crime", reason: "Unmatched philosophical clash between Batman and the Joker." },
        { title: "Mad Max: Fury Road", genre: "Action / Post-Apocalyptic", reason: "Relentless high-octane vehicular chase with astonishing practical stunts." },
        { title: "John Wick: Chapter 4", genre: "Action / Neo-Noir", reason: "Peerless choreography and global world-building for the legendary assassin." },
        { title: "Top Gun: Maverick", genre: "Action / Aerial", reason: "Thrilling visceral aerial dogfights and deep emotional resonance." },
        { title: "Gladiator", genre: "Action / Historical", reason: "Iconic tale of vengeance, honor, and courage in ancient Rome." },
    ],
    comedy: [
        { title: "3 Idiots", genre: "Comedy / Drama", reason: "Heartwarming and hilarious story celebrating friendship and passion over societal pressure." },
        { title: "Superbad", genre: "Comedy / Coming-of-Age", reason: "Hilariously awkward teen escapades with unforgettable iconic characters." },
        { title: "The Grand Budapest Hotel", genre: "Comedy / Adventure", reason: "Wes Anderson's whimsical, meticulously styled comedic caper." },
        { title: "Knives Out", genre: "Comedy / Mystery", reason: "Witty, star-studded whodunnit full of eccentric suspects and sharp humor." },
        { title: "Hera Pheri", genre: "Comedy / Cult Classic", reason: "Legendary comedic misunderstandings and peak comedic timing." },
    ],
    thriller: [
        { title: "Oppenheimer", genre: "Thriller / Biography", reason: "Tense biographical thriller detailing the moral weight of the atomic bomb." },
        { title: "Shutter Island", genre: "Psychological Thriller", reason: "Twisted investigation on a remote asylum island with an astonishing finale." },
        { title: "Gone Girl", genre: "Mystery / Thriller", reason: "Dark, razor-sharp exploration of media circus and marriage secrets." },
        { title: "Parasite", genre: "Thriller / Dark Comedy", reason: "Masterclass in class warfare, social satire, and escalating suspense." },
        { title: "Se7en", genre: "Crime / Thriller", reason: "Grim and intense detective hunt for a serial killer punishing the deadly sins." },
    ],
    animation: [
        { title: "Spider-Man: Across the Spider-Verse", genre: "Animation / Superhero", reason: "Revolutionary visual animation styles and multiverse storytelling." },
        { title: "Spirited Away", genre: "Animation / Fantasy", reason: "Hayao Miyazaki's magical, enchanting spirit realm masterpiece." },
        { title: "Coco", genre: "Animation / Musical", reason: "Stunning, heartfelt tribute to Mexican culture, memory, and family." },
        { title: "WALL-E", genre: "Animation / Sci-Fi", reason: "Poetic, tender environmental romance with extraordinary visual storytelling." },
        { title: "Your Name", genre: "Animation / Romance", reason: "Visually gorgeous cosmic connection and body-swap romance across timelines." },
    ],
};

// Free tier Gemini models in order of priority & responsiveness
const GEMINI_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-flash-latest",
];

const cleanJsonString = (raw: string): string => {
    return raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
};

export const getGeminiApiKey = (): string => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (key && key.trim().length > 5) {
        return key.trim();
    }
    return "";
};

/**
 * Executes a prompt across a cascade of Gemini models, automatically falling back
 * if a model encounters 503 high demand, 429 rate limits, or transient errors.
 */
const callGeminiWithFallback = async (
    prompt: string,
    temperature = 0.7,
    maxOutputTokens = 2048
): Promise<string | null> => {
    const apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.trim().length <= 5) return null;

    for (let i = 0; i < GEMINI_MODELS.length; i++) {
        const model = GEMINI_MODELS[i];
        try {
            console.info(`[Gemini AI API] 🤖 [Model ${i + 1}/${GEMINI_MODELS.length}: ${model}] POST /v1beta/models/${model}:generateContent`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature,
                            maxOutputTokens,
                        },
                    }),
                }
            );

            console.info(`[Gemini AI API] 📥 Model [${model}] status [${response.status}]`);

            if (response.ok) {
                const data = await response.json();
                const parts = data?.candidates?.[0]?.content?.parts || [];
                const rawText = parts
                    .filter((p: any) => typeof p.text === 'string')
                    .map((p: any) => p.text)
                    .join('');

                if (rawText && rawText.trim().length > 0) {
                    return rawText;
                }
            } else {
                console.warn(`[Gemini AI API] ⚠️ Model [${model}] returned status ${response.status}, trying fallback model...`);
            }
        } catch (err) {
            console.warn(`[Gemini AI API] ⚠️ Error requesting model [${model}]:`, err);
        }
    }

    console.warn(`[Gemini AI API] ❌ All ${GEMINI_MODELS.length} Gemini models exhausted`);
    return null;
};

export const getGeminiMovieRecommendations = async (
    query: string
): Promise<{ recommendations: GeminiMovieRecommendation[]; titles: string[] }> => {
    const apiKey = getGeminiApiKey();

    if (apiKey && apiKey.trim().length > 5) {
        try {
            const prompt = `You are an expert AI Movie Recommendation Engine. 
The user is looking for movies based on this request: "${query}".
Suggest exactly 5 unique, highly relevant movies that perfectly match this vibe.
Respond ONLY with a valid JSON array containing exactly 5 objects, with NO markdown formatting, NO backticks, and NO extra text.
Each object must have these exact keys:
- "title": string (the exact movie title)
- "genre": string (e.g. "Sci-Fi / Thriller")
- "reason": string (a short 1-2 sentence compelling reason why the user will love it)`;

            const rawText = await callGeminiWithFallback(prompt, 0.7, 2048);

            if (rawText) {
                const cleanedText = cleanJsonString(rawText);
                const parsed = JSON.parse(cleanedText) as GeminiMovieRecommendation[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.info(
                        `[Gemini AI API] ✅ Successfully generated ${parsed.length} AI recommendations:`,
                        parsed.map((item) => item.title)
                    );
                    return {
                        recommendations: parsed,
                        titles: parsed.map((item) => item.title),
                    };
                }
            }
        } catch (err) {
            console.warn("[Gemini AI API] ⚠️ Failed to parse AI recommendations, falling back to curated list:", err);
        }
    } else {
        console.info(`[Gemini AI Service] ℹ️ Gemini API key not provided, using curated AI engine fallback for query: "${query}"`);
    }

    // Smart fallback based on query text
    const lower = query.toLowerCase();
    let categoryKey = "scifi";
    if (lower.includes("action") || lower.includes("fight") || lower.includes("war") || lower.includes("batman")) {
        categoryKey = "action";
    } else if (lower.includes("funny") || lower.includes("comedy") || lower.includes("laugh") || lower.includes("feel-good")) {
        categoryKey = "comedy";
    } else if (lower.includes("thrill") || lower.includes("suspense") || lower.includes("crime") || lower.includes("mystery") || lower.includes("twist")) {
        categoryKey = "thriller";
    } else if (lower.includes("anime") || lower.includes("animat") || lower.includes("cartoon") || lower.includes("kids")) {
        categoryKey = "animation";
    }

    const recs = FALLBACK_RECOMMENDATIONS[categoryKey] || FALLBACK_RECOMMENDATIONS.scifi;
    console.info(
        `[Gemini AI Service] 🎯 Curated recommendations selected (${categoryKey}):`,
        recs.map((r) => r.title)
    );
    return {
        recommendations: recs,
        titles: recs.map((r) => r.title),
    };
};

export const getGeminiMovieDetails = async (
    title: string
): Promise<{
    overview: string;
    tagline: string;
    releaseYear: number;
    rating: number;
    genres: string[];
    cast: { name: string; character: string }[];
    providers: string[];
    trailerQuery: string;
} | null> => {
    const apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.trim().length <= 5) return null;

    try {
        const prompt = `You are a film database API. Provide verified, accurate metadata for the movie "${title}".
Respond ONLY with a raw JSON object with NO markdown formatting, NO backticks, and NO commentary.
Exact JSON structure required:
{
  "overview": string (2-3 sentence accurate plot summary),
  "tagline": string (official or iconic tagline),
  "releaseYear": number (4-digit year),
  "rating": number (IMDb score e.g. 8.4),
  "genres": string[] (array of 2-3 genres e.g. ["Sci-Fi", "Drama"]),
  "cast": [
    {"name": string, "character": string},
    {"name": string, "character": string},
    {"name": string, "character": string},
    {"name": string, "character": string}
  ],
  "providers": string[] (platforms where it streams e.g. ["Prime Video", "Netflix", "Apple TV+"]),
  "trailerQuery": string (e.g. "${title} official trailer")
}`;

        const rawText = await callGeminiWithFallback(prompt, 0.2, 2048);
        if (!rawText) return null;

        const cleanedText = cleanJsonString(rawText);
        const parsed = JSON.parse(cleanedText);
        console.info(`[Gemini AI API] ✅ Successfully generated deep metadata for "${title}":`, parsed.cast?.map((c: any) => c.name));
        return parsed;
    } catch (err) {
        console.warn(`[Gemini AI API] ⚠️ Failed to parse Gemini details for "${title}":`, err);
        return null;
    }
};
