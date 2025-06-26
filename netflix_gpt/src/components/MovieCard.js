import { IMG_CDN_URL } from "../utils/constant";

const MovieCard = ({ posterPath }) => {
  return (
    <div className="w-44">
      <img
        src={IMG_CDN_URL + posterPath}
        alt="Movie card"
        className="rounded-md"
      />
    </div>
  );
};

export default MovieCard;
