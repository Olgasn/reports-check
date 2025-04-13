import { ICheck, ICheckResult, Thunk, ThunkInit } from '@@types';
import { createSlice } from '@reduxjs/toolkit';
import { checkReports, getLabChecks } from './reports.thunk';

interface State {
  results: ICheck[];
  checkReportsThunk: Thunk;
  labChecks: { labId: number; results: ICheckResult[] }[];
  getLabChecksThunk: Thunk;
}

const state: State = {
  results: [],
  labChecks: [],
  checkReportsThunk: ThunkInit(),
  getLabChecksThunk: ThunkInit(),
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
      })

      .addCase(getLabChecks.pending, (state) => {
        state.getLabChecksThunk.status = 'pending';
      })
      .addCase(getLabChecks.fulfilled, (state, action) => {
        state.getLabChecksThunk.status = 'succeeded';

        const { labId, result } = action.payload;

        state.labChecks.push({ labId, results: result });
      })
      .addCase(getLabChecks.rejected, (state, action) => {
        state.getLabChecksThunk.status = 'rejected';
        state.getLabChecksThunk.error = action.error.message ?? 'Unknown Error';
      });
  },
});
