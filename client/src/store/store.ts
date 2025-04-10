import { configureStore } from '@reduxjs/toolkit';
import {
  courseSlice,
  groupSlice,
  labsSlice,
  reportsSlice,
  settingsSlice,
  studentSlice,
} from './features';

export const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    reports: reportsSlice.reducer,
    course: courseSlice.reducer,
    labs: labsSlice.reducer,
    students: studentSlice.reducer,
    groups: groupSlice.reducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
