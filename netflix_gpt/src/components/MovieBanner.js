import { useSelector } from "react-redux";

import MovieBannerTitle from "./MovieBannerTitle";
import MovieBannerTrailer from "./MovieBannerTrailer";

const MovieBanner = () => {
  const movies = useSelector((store) => store.movies?.nowPlayingMovies);

  if (!movies) return;

  const mainMovie = movies[1];

  const { original_title, overview, id } = mainMovie;

  return (
    <div>
      <MovieBannerTitle videoTitle={original_title} overview={overview} />
      <MovieBannerTrailer videoId={id} />
    </div>
  );
};

export default MovieBanner;
