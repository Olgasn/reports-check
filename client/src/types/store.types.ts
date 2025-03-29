import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@store';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();

export type ThunkStatus = 'idle' | 'pending' | 'succeeded' | 'rejected';

export interface Thunk {
  status: ThunkStatus;
  error: string | null;
}

export const ThunkInit = () => ({
  status: 'idle' as ThunkStatus,
  error: null,
});
