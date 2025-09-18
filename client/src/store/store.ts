import { configureStore } from '@reduxjs/toolkit';

import { notificationSlice } from './reducers/notifications.reducer';

export const store = configureStore({
  reducer: {
    notifications: notificationSlice.reducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
