import { ICheckResult } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';
import { useQuery } from '@tanstack/react-query';

export const useLabChecks = (labId: number) =>
  useQuery<ICheckResult[]>({
    queryKey: [QUERY_KEYS.REPORTS, labId],
    queryFn: () => api.get(`/reports/lab-checks/${labId}`).then((res) => res.data),
  });
