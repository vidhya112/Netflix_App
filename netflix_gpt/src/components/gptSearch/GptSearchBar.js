import { useDispatch, useSelector } from "react-redux";
import { FaSistrix } from "react-icons/fa6";
import { useRef } from "react";

import { language } from "../../utils/languageConstant";
// import openai from "../utils/openai";
import { GET_OPTIONS, getMovieList } from "../../utils/constant";
import { addGptSearchMovies } from "../../features/gptSlice";

const GptSearchBar = () => {
  const languageKey = useSelector((store) => store.config.lang);

  const searchText = useRef(null);
  const dispatch = useDispatch();

  const searchMovieTMDB = async (movie) => {
    const data = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${movie}&include_adult=false&language=en-US&page=1`,
      GET_OPTIONS
    );
    const json = await data.json();
    return json.results;
  };

  // commenting openai api call as billing setup is not completed

  // const searchQuery =
  //   "Act as a Movies Recommendation system suggest some movies for the query" +
  //   searchText.current?.value +
  //   ". Give me the result as 5 movies with comma separated as mentioned in the following example. Example: Golmaal, Herapheri, Kesari, Barfi, 3-Idiots";

  const handleSearch = async () => {
    // const gptSearchResults = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   store: true,
    //   messages: [{ role: "user", content: searchQuery }],
    // });

    // const getMovieList = gptSearchResults?.choices[0].message.content.split(",")

    const promiseArray = getMovieList.map((movie) => searchMovieTMDB(movie));
    const tmdbResults = await Promise.all(promiseArray);
    dispatch(
      addGptSearchMovies({ movieNames: getMovieList, movieResults: tmdbResults })
    );
  };

  return (
    <div className="pt-[12%] flex justify-center">
      <form
        className="w-1/2 grid grid-cols-12 bg-black"
        onClick={(e) => e.preventDefault()}
      >
        <input
          ref={searchText}
          type="text"
          placeholder={language[languageKey].getSearchPlaceholder}
          className="col-span-9 m-4 p-3"
        />
        <button
          className="col-span-3 bg-red-600 text-lg text-white px-4 py-2 rounded-md my-4 mx-2 font-semibold flex"
          onClick={handleSearch}
        >
          <FaSistrix size={22} className="mr-2 ml-4 mt-1" />
          {language[languageKey].search}
        </button>
      </form>
    </div>
  );
};

export default GptSearchBar;
