import { Movie } from './movie.types';

export interface GptSearchState {
  showGptSearch: boolean;
  movieNames: string[] | null;
  movieResults: Movie[][] | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

export interface GeminiMovieRecommendation {
  title: string;
  genre: string;
  reason: string;
}
