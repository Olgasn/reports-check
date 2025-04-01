import { CheckResult, Thunk, ThunkInit } from '@@types';
import { createSlice } from '@reduxjs/toolkit';
import { checkReports } from './reports.thunk';

interface State {
  results: CheckResult[];
  checkReportsThunk: Thunk;
}

const state: State = {
  results: [],
  checkReportsThunk: ThunkInit(),
};

export const reportsSlice = createSlice({
  name: 'reports',
  initialState: state,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkReports.pending, (state) => {
        state.checkReportsThunk.status = 'pending';
      })
      .addCase(checkReports.fulfilled, (state, action) => {
        state.checkReportsThunk.status = 'succeeded';

        const result = action.payload;

        state.results = result;
      })
      .addCase(checkReports.rejected, (state, action) => {
        state.checkReportsThunk.status = 'rejected';
        state.checkReportsThunk.error = action.error.message ?? 'Unknown Error';
      });
  },
});
