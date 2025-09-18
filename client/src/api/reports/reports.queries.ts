import { ICheck, ICheckResult, IGetChecks } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';
import { useQuery } from '@tanstack/react-query';

export const useLabChecks = (labId: number) =>
  useQuery<ICheckResult[]>({
    queryKey: [QUERY_KEYS.REPORTS, labId],
    queryFn: () => api.get(`/reports/lab-checks/${labId}`).then((res) => res.data),
  });

export const useChecks = (data: IGetChecks) =>
  useQuery<ICheck[]>({
    queryKey: [QUERY_KEYS.REPORTS, data.ids],
    queryFn: () => api.post(`/reports/checks`, data).then((res) => res.data),
  });
