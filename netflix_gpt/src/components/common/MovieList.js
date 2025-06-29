import React from "react";
import MovieCard from "./MovieCard";

const MovieList = ({ title, movies }) => {
  return (
    <div className="px-6">
      <h1 className="py-3 text-white text-2xl">{title}</h1>
      <div className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory space-x-4 pb-5">
        {movies &&
          movies.map((movie) => {
            return (
              <div key={movie.id} className="snap-start">
                <MovieCard posterPath={movie.poster_path} />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MovieList;
