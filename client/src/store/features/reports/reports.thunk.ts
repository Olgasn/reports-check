import { createAppAsyncThunk, ICheckData } from '@@types';
import { reportsApi } from '@api';

export const checkReports = createAppAsyncThunk(
  'reports/checkReports',
  async (data: ICheckData) => {
    const result = await reportsApi.checkReports(data);

    return result;
  }
);

export const getLabChecks = createAppAsyncThunk('reports/getLabChecks', async (labId: number) => {
  const result = await reportsApi.getLabChecks(labId);

  return { labId, result };
});
