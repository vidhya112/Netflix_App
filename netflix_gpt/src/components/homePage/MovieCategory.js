import { useSelector } from "react-redux";

import MovieList from "../common/MovieList";

const MovieCategory = () => {
  const movies = useSelector((store) => store.movies);
  return (
    <div className="bg-black w-screen">
      <div className="-mt-52 relative z-20 pl-12">
        <MovieList
          title="Now Playing Movies"
          movies={movies.nowPlayingMovies}
        />
        <MovieList title="Popular Movies" movies={movies.popularMovies} />
        <MovieList title="Top Rated Movies" movies={movies.topRatedMovies} />
        <MovieList title="Upcoming Movies" movies={movies.upcomingMovies} />
      </div>
    </div>
  );
};

export default MovieCategory;
