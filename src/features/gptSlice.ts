import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Movie } from "../types/movie.types";
import { GeminiMovieRecommendation } from "../types/gpt.types";

export interface GptSliceState {
  showGptSearch: boolean;
  movieNames: string[] | null;
  movieResults: Movie[][] | null;
  aiRecommendations: GeminiMovieRecommendation[] | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: GptSliceState = {
    showGptSearch: false,
    movieNames: null,
    movieResults: null,
    aiRecommendations: null,
    isLoading: false,
    error: null,
    searchQuery: "",
};

const gptSlice = createSlice({
    name: "gpt",
    initialState,
    reducers: {
        toggleGptSearchView: (state) => {
            state.showGptSearch = !state.showGptSearch;
        },
        setGptSearchView: (state, action: PayloadAction<boolean>) => {
            state.showGptSearch = action.payload;
        },
        setGptLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
            state.error = null;
        },
        setGptError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        addGptSearchMovies: (
            state,
            action: PayloadAction<{
        movieNames: string[];
        movieResults: Movie[][];
        aiRecommendations?: GeminiMovieRecommendation[];
      }>
        ) => {
            const { movieNames, movieResults, aiRecommendations } = action.payload;
            state.movieNames = movieNames;
            state.movieResults = movieResults;
            state.aiRecommendations = aiRecommendations || null;
            state.isLoading = false;
            state.error = null;
        },
        clearGptResults: (state) => {
            state.movieNames = null;
            state.movieResults = null;
            state.aiRecommendations = null;
            state.searchQuery = "";
            state.error = null;
        },
    },
});

export const {
    toggleGptSearchView,
    setGptSearchView,
    setGptLoading,
    setGptError,
    setSearchQuery,
    addGptSearchMovies,
    clearGptResults,
} = gptSlice.actions;

export default gptSlice.reducer;
