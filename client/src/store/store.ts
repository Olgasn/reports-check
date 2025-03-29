import { configureStore } from '@reduxjs/toolkit';
import { settingsSlice } from './features';

export const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
