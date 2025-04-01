import { CheckData, CheckResult } from '@@types';
import { api } from './api';

export const checkReports = async (data: CheckData) => {
  const { reportsZip, task, modelId } = data;

  const formData = new FormData();

  formData.append('reportsZip', reportsZip);
  formData.append('task', task);
  formData.append('modelId', modelId.toString());

  const response = await api.post<CheckResult[]>('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 0,
  });
  return response.data;
};
