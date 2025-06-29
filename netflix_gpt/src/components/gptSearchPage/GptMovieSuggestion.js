import { useSelector } from "react-redux";

import MovieList from "../common/MovieList";

const GptMovieSuggestion = () => {
  const { movieNames, movieResults } = useSelector((store) => store.gpt);
  if (!movieNames || !movieResults) return null;

  return (
    <div className="mt-10 m-4 bg-black">
      {movieNames.map((movie, index) => (
        <MovieList title={movie} movies={movieResults[index]} />
      ))}
    </div>
  );
};

export default GptMovieSuggestion;
