import React from "react";

const MovieBannerTitle = ({ videoTitle, overview }) => {
  return (
    <div className="pt-36 px-12 absolute w-screen aspect-video text-white">
      <h1 className="text-black font-bold text-3xl">{videoTitle}</h1>
      <p className="py-6 w-1/3">{overview}</p>
      <div>
        <button>Play</button>
        <button className="px-8 py-3 text-md mx-2 text-white bg-gray-500 opacity-50 rounded-md font-bold">
          More Info
        </button>
      </div>
    </div>
  );
};

export default MovieBannerTitle;
