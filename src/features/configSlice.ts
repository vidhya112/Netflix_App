import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToastNotification {
  id: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

interface ConfigState {
  lang: string;
  isMuted: boolean;
  activeNavTab: string;
  toast: ToastNotification | null;
}

const initialState: ConfigState = {
    lang: "en",
    isMuted: true,
    activeNavTab: "home",
    toast: null,
};

const configSlice = createSlice({
    name: "config",
    initialState,
    reducers: {
        changeLanguage: (state, action: PayloadAction<string>) => {
            state.lang = action.payload;
        },
        toggleMute: (state) => {
            state.isMuted = !state.isMuted;
        },
        setMuted: (state, action: PayloadAction<boolean>) => {
            state.isMuted = action.payload;
        },
        setActiveNavTab: (state, action: PayloadAction<string>) => {
            state.activeNavTab = action.payload;
        },
        showToast: (
            state,
            action: PayloadAction<{ message: string; type?: "info" | "success" | "warning" | "error" }>
        ) => {
            state.toast = {
                id: Date.now().toString(),
                message: action.payload.message,
                type: action.payload.type || "info",
            };
        },
        hideToast: (state) => {
            state.toast = null;
        },
    },
});

export const {
    changeLanguage,
    toggleMute,
    setMuted,
    setActiveNavTab,
    showToast,
    hideToast,
} = configSlice.actions;

export default configSlice.reducer;
