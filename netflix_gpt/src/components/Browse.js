import { useSelector } from "react-redux";

import Header from "./Header";
import useNowPlayingMovies from "../hooks/useNowPlayingMovies";
import MovieBanner from "./MovieBanner";
import MovieCategory from "./MovieCategory";
import usePopularMovies from "../hooks/usePopularMovies";
import useTopRatedMovies from "../hooks/useTopRatedMovies";
import useUpcomingMovies from "../hooks/useUpcomingMovies";
import GptSearch from "./GptSearch";

const Browse = () => {
  const showGptSearch = useSelector((state) => state.gpt.showGptSearch);

  useNowPlayingMovies();
  usePopularMovies();
  useTopRatedMovies();
  useUpcomingMovies();

  return (
    <div>
      <Header />
      {showGptSearch ? (
        <GptSearch />
      ) : (
        <>
          <MovieBanner />
          <MovieCategory />
        </>
      )}
    </div>
  );
};
/* 
      Main container
        - Video background
        - video title
      Second container
        - movie list
            - cards
      */

export default Browse;
