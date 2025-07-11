import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { GET_OPTIONS } from "../utils/constant";
import { addTrailerVideo } from "../features/movieSlice";

const useTrailerVideo = (videoId) => {
  const dispatch = useDispatch();
  const trailerVideo = useSelector((store) => store.movies?.trailerVideo);

  const getMovieVideos = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/movie/${videoId}/videos?language=en-US`,
      GET_OPTIONS
    );
    const json = await data.json();

    const movieTrailerList = json.results.filter(
      (movie) => movie.type === "Trailer"
    );
    const trailer = movieTrailerList.length
      ? movieTrailerList[0]
      : json.results[0];

    dispatch(addTrailerVideo(trailer));
  };

  useEffect(() => {
    !trailerVideo && getMovieVideos();
  }, []);
};

export default useTrailerVideo;
