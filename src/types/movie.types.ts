export interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  adult?: boolean;
}

export type WatchlistItem = Movie & { addedAt?: string };

export interface Genre {
  id: number;
  name: string;
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProvidersResponse {
    results?: Record<
        string,
        {
            link?: string;
            flatrate?: WatchProvider[];
            rent?: WatchProvider[];
            buy?: WatchProvider[];
        }
    >;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  videos?: { results: MovieVideo[] };
  credits?: { cast: CastMember[] };
  recommendations?: { results: Movie[] };
  similar?: { results: Movie[] };
}

export interface MovieState {
  nowPlayingMovies: Movie[] | null;
  popularMovies: Movie[] | null;
  topRatedMovies: Movie[] | null;
  upcomingMovies: Movie[] | null;
  trendingMovies: Movie[] | null;
  trailerVideo: MovieVideo | null;
  selectedMovie: MovieDetails | null;
  selectedMovieTrailer: MovieVideo | null;
  selectedMovieCast: CastMember[] | null;
  selectedMovieProviders: WatchProvider[] | null;
  isModalOpen: boolean;
  isLoading: boolean;
}
