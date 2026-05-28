import { useQuery } from '@tanstack/react-query';

import { IGroup } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';

export const useGroup = (id: number) =>
  useQuery<IGroup>({
    queryKey: [QUERY_KEYS.GROUPS, id],
    queryFn: () => api.get(`/groups/${id}`).then((res) => res.data),
  });

export const useGroups = () =>
  useQuery<IGroup[]>({
    queryKey: [QUERY_KEYS.GROUPS],
    queryFn: () => api.get('/groups').then((res) => res.data),
  });
