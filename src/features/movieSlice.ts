import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Movie, MovieDetails, MovieState, MovieVideo, CastMember, WatchProvider } from "../types/movie.types";

interface ExtendedMovieState extends MovieState {
  isVideoModalOpen: boolean;
  playingTrailerKey: string | null;
  playingMovieTitle: string | null;
}

const initialState: ExtendedMovieState = {
    nowPlayingMovies: null,
    popularMovies: null,
    topRatedMovies: null,
    upcomingMovies: null,
    trendingMovies: null,
    trailerVideo: null,
    selectedMovie: null,
    selectedMovieTrailer: null,
    selectedMovieCast: null,
    selectedMovieProviders: null,
    isModalOpen: false,
    isVideoModalOpen: false,
    playingTrailerKey: null,
    playingMovieTitle: null,
    isLoading: false,
};

const movieSlice = createSlice({
    name: "movies",
    initialState,
    reducers: {
        addNowPlayingMovies: (state, action: PayloadAction<Movie[]>) => {
            state.nowPlayingMovies = action.payload;
        },
        addPopularMovies: (state, action: PayloadAction<Movie[]>) => {
            state.popularMovies = action.payload;
        },
        addTopRatedMovies: (state, action: PayloadAction<Movie[]>) => {
            state.topRatedMovies = action.payload;
        },
        addUpcomingMovies: (state, action: PayloadAction<Movie[]>) => {
            state.upcomingMovies = action.payload;
        },
        addTrendingMovies: (state, action: PayloadAction<Movie[]>) => {
            state.trendingMovies = action.payload;
        },
        addTrailerVideo: (state, action: PayloadAction<MovieVideo | null>) => {
            state.trailerVideo = action.payload;
        },
        setSelectedMovie: (state, action: PayloadAction<MovieDetails | null>) => {
            state.selectedMovie = action.payload;
            state.isModalOpen = action.payload !== null;
        },
        setSelectedMovieTrailer: (state, action: PayloadAction<MovieVideo | null>) => {
            state.selectedMovieTrailer = action.payload;
        },
        setSelectedMovieCast: (state, action: PayloadAction<CastMember[] | null>) => {
            state.selectedMovieCast = action.payload;
        },
        setSelectedMovieProviders: (state, action: PayloadAction<WatchProvider[] | null>) => {
            state.selectedMovieProviders = action.payload;
        },
        closeModal: (state) => {
            state.isModalOpen = false;
            state.selectedMovie = null;
            state.selectedMovieTrailer = null;
            state.selectedMovieCast = null;
            state.selectedMovieProviders = null;
        },
        openVideoModal: (
            state,
            action: PayloadAction<{ trailerKey: string; title: string }>
        ) => {
            state.isVideoModalOpen = true;
            state.playingTrailerKey = action.payload.trailerKey;
            state.playingMovieTitle = action.payload.title;
        },
        closeVideoModal: (state) => {
            state.isVideoModalOpen = false;
            state.playingTrailerKey = null;
            state.playingMovieTitle = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    addNowPlayingMovies,
    addPopularMovies,
    addTopRatedMovies,
    addUpcomingMovies,
    addTrendingMovies,
    addTrailerVideo,
    setSelectedMovie,
    setSelectedMovieTrailer,
    setSelectedMovieCast,
    setSelectedMovieProviders,
    closeModal,
    openVideoModal,
    closeVideoModal,
    setLoading,
} = movieSlice.actions;

export default movieSlice.reducer;
