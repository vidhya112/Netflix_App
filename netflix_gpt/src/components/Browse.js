import Header from "./Header";
import useNowPlayingMovies from "../hooks/useNowPlayingMovies";
import MovieBanner from "./MovieBanner";
import MovieCategory from "./MovieCategory";
import usePopularMovies from "../hooks/usePopularMovies";
import useTopRatedMovies from "../hooks/useTopRatedMovies";
import useUpcomingMovies from "../hooks/useUpcomingMovies";

const Browse = () => {
  useNowPlayingMovies();
  usePopularMovies();
  useTopRatedMovies();
  useUpcomingMovies();

  return (
    <div>
      <Header />
      {/* 
      Main container
        - Video background
        - video title
      Second container
        - movie list
            - cards
      */}
      <MovieBanner />
      <MovieCategory />
    </div>
  );
};

export default Browse;
