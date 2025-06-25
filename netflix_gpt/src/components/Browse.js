import { useEffect } from "react";
import Header from "./Header";
import { GET_OPTIONS } from "../utils/constant";
import { addNowPlayingMovies } from "../utils/movieSlice";
import { useDispatch } from "react-redux";

const Browse = () => {
  const dispatch = useDispatch();

  const getNowPlayingMovies = async () => {
    const data = await fetch(
      "https://api.themoviedb.org/3/movie/now_playing?page=1",
      GET_OPTIONS
    );
    const json = await data.json();
    console.log(json.results)
    dispatch(addNowPlayingMovies(json.results));
  };

  useEffect(() => {
    getNowPlayingMovies();
  }, []);

  return (
    <div>
      <Header />
    </div>
  );
};

export default Browse;
