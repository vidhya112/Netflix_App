import { FaPlay, FaCircleInfo } from "react-icons/fa6";

const MovieBannerTitle = ({ videoTitle, overview }) => {
  return (
    <div className="pt-[20%] px-24 absolute w-screen aspect-video text-white bg-gradient-to-r from-black">
      <h1 className="font-bold text-5xl">{videoTitle}</h1>
      <p className="py-6 w-1/3 text-lg">{overview}</p>
      <div className="flex">
        <button className="bg-white text-black py-3 px-6 font-bold text-lg rounded-md flex hover:bg-opacity-70">
          <FaPlay size={25} className="mr-2 mt-1" />
          Play
        </button>
        <button className="px-7 py-3 text-lg mx-3 text-white bg-gray-500 rounded-md font-bold flex">
          <FaCircleInfo size={25} className="mr-2 mt-1" />
          More Info
        </button>
      </div>
    </div>
  );
};

export default MovieBannerTitle;
