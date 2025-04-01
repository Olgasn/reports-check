import { CheckData, createAppAsyncThunk } from '@@types';
import { reportsApi } from '@api';

export const checkReports = createAppAsyncThunk('reports/checkReports', async (data: CheckData) => {
  const result = await reportsApi.checkReports(data);

  return result;
});
