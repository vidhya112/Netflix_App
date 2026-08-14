import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile, UserState } from "../types/user.types";
import { USER_AVATARS } from "../utils/constant";

const initialState: UserState = {
    user: null,
    isLoading: false,
    activeProfile: USER_AVATARS[0].url,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfile | null>) => {
            state.user = action.payload;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setActiveProfile: (state, action: PayloadAction<string>) => {
            state.activeProfile = action.payload;
            if (state.user) {
                state.user.photoURL = action.payload;
            }
        },
        removeUser: (state) => {
            state.user = null;
            state.isLoading = false;
        },
    },
});

export const { setUser, setLoading, setActiveProfile, removeUser } = userSlice.actions;
export default userSlice.reducer;
