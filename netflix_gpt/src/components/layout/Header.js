import { signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { auth } from "../../utils/firebase";
import { addUser, removeUser } from "../../features/userSlice";
import {
  ROUTE,
  LOGO,
  USER_AVATAR,
  SUPPORTED_LANGUAGE,
} from "../../utils/constant";
import { toggleGptSearchView } from "../../features/gptSlice";
import { changeLanguage } from "../../features/configSlice";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((store) => store.user);
  const showGptSearch = useSelector((store) => store.gpt.showGptSearch);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName } = user;
        dispatch(addUser({ uid: uid, email: email, displayName: displayName }));
        navigate(ROUTE.BROWSE);
      } else {
        dispatch(removeUser());
        navigate(ROUTE.LOGIN);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {})
      .catch((error) => {});
  };

  const handleGptSearchClick = () => {
    dispatch(toggleGptSearchView());
  };

  const handleLanguageChange = (e) => {
    dispatch(changeLanguage(e.target.value));
  };

  return (
    <div className="absolute w-full px-10 py-2 bg-gradient-to-b from-black z-10 flex justify-between">
      <img className="w-44" src={LOGO} alt="Netflix logo" />
      {user && (
        <div className="p-2 flex">
          {showGptSearch && (
            <select
              className="py=2 px-6 m-2 bg-gray-800 text-white"
              onChange={(e) => handleLanguageChange(e)}
            >
              {SUPPORTED_LANGUAGE.map((lang) => (
                <option key={lang.identifier} value={lang.identifier}>
                  {lang.name}
                </option>
              ))}
            </select>
          )}
          <button
            className="mx-2 h-10 mt-2 font-bold text-white px-3 bg-purple-600 rounded-xl"
            onClick={handleGptSearchClick}
          >
            GPT Search
          </button>
          {/* <h1 className="p-3 mx-1 font-bold text-lg">{user.displayName}</h1> */}
          <img
            className="w-10 h-10 rounded-md my-2"
            src={USER_AVATAR}
            alt="user-avatar"
          />
          <button
            className="h-12 mx-2 font-bold text-white px-3 bg-black rounded-xl"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
