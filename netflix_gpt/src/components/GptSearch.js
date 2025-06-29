import React from "react";
import GptSearchBar from "./GptSearchBar";
import { BACKGROUND_IMAGE } from "../utils/constant";

const GptSearch = () => {
  return (
    <div>
      <div className="absolute w-screen h-screen overflow-hidden -z-10">
        <img
          className="w-full h-full brightness-50"
          src={BACKGROUND_IMAGE}
          alt="background-img"
        />
      </div>
      <GptSearchBar />
    </div>
  );
};

export default GptSearch;
