import Header from "./Header";
import useNowPlayingMovies from "../hooks/useNowPlayingMovies";
import MovieBanner from "./MovieBanner";

const Browse = () => {
  useNowPlayingMovies();
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
    </div>
  );
};

export default Browse;
