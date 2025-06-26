import { useSelector } from "react-redux";

import useTrailerVideo from "../hooks/useTrailerVideo";

const MovieBannerTrailer = ({ videoId }) => {
  const trailer = useSelector((store) => store.movies?.trailerVideo);

  useTrailerVideo(videoId);

  return (
    <div>
      <iframe
        className="w-screen aspect-video"
        src={`https://www.youtube.com/embed/${trailer?.key}?autoplay=1&mute=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default MovieBannerTrailer;
