import { configureStore } from "@reduxjs/toolkit";

import userReducer from "../features/userSlice";
import movieReducer from "../features/movieSlice";
import gptReducer from "../features/gptSlice";
import configReducer from "../features/configSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    movies: movieReducer,
    gpt: gptReducer,
    config: configReducer,
  },
});

export default appStore;
