import { IKey } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';
import { useQuery } from '@tanstack/react-query';

export const useKey = (id: number) =>
  useQuery<IKey>({
    queryKey: [QUERY_KEYS.KEYS, id],
    queryFn: () => api.get(`/keys/${id}`).then((res) => res.data),
  });

export const useKeys = () =>
  useQuery<IKey[]>({
    queryKey: [QUERY_KEYS.KEYS],
    queryFn: () => api.get('/keys').then((res) => res.data),
  });
