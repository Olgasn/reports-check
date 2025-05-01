import { ICheck, ICheckData, ICheckResult } from '@@types';
import { api } from './api';
import { prepareFormData } from '@utils';

export const checkReports = async (data: ICheckData) => {
  const formData = prepareFormData(data);

  const response = await api.post<ICheck[]>('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 0,
  });

  return response.data;
};

export const getLabChecks = async (labId: number) => {
  const response = await api.get<ICheckResult[]>(`/reports/lab-checks/${labId}`);

  return response.data;
};
