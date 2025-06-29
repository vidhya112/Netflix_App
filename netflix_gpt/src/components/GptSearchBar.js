import { useSelector } from "react-redux";
import { FaSistrix } from "react-icons/fa6";

import { language } from "../utils/languageConstant";

const GptSearchBar = () => {
  const languageKey = useSelector((store) => store.config.lang);

  return (
    <div className="pt-[12%] flex justify-center">
      <form className="w-1/2 grid grid-cols-12 bg-black">
        <input
          type="text"
          placeholder={language[languageKey].getSearchPlaceholder}
          className="col-span-9 m-4 p-3"
        />
        <button className="col-span-3 bg-red-600 text-lg text-white px-4 py-2 rounded-md my-4 mx-2 font-semibold flex">
          <FaSistrix size={22} className="mr-2 ml-4 mt-1" />
          {language[languageKey].search}
        </button>
      </form>
    </div>
  );
};

export default GptSearchBar;
