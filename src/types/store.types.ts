import { store } from '../store/appStore';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
