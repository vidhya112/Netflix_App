import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile, UserSession, UserState } from "../types/user.types";
import { USER_AVATARS } from "../utils/constant";

const initialState: UserState = {
    user: null,
    isLoading: false,
    activeProfile: USER_AVATARS[0].url,
    sessions: [],
    jwtToken: null,
    authError: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfile | null>) => {
            state.user = action.payload;
            state.isLoading = false;
            state.authError = null;
            if (action.payload?.jwtToken) {
                state.jwtToken = action.payload.jwtToken;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setJwtToken: (state, action: PayloadAction<string | null>) => {
            state.jwtToken = action.payload;
            if (state.user) {
                state.user.jwtToken = action.payload;
            }
        },
        setSessions: (state, action: PayloadAction<UserSession[]>) => {
            state.sessions = action.payload;
        },
        setAuthError: (state, action: PayloadAction<string | null>) => {
            state.authError = action.payload;
            state.isLoading = false;
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
            state.sessions = [];
            state.jwtToken = null;
            state.authError = null;
        },
    },
});

export const {
    setUser,
    setLoading,
    setJwtToken,
    setSessions,
    setAuthError,
    setActiveProfile,
    removeUser,
} = userSlice.actions;

export default userSlice.reducer;
