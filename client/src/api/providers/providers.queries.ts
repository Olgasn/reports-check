import { IProvider } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';
import { useQuery } from '@tanstack/react-query';

export const useProvider = (id: number) =>
  useQuery<IProvider>({
    queryKey: [QUERY_KEYS.PROVIDERS, id],
    queryFn: () => api.get(`/providers/${id}`).then((res) => res.data),
  });

export const useProviders = () =>
  useQuery<IProvider[]>({
    queryKey: [QUERY_KEYS.PROVIDERS],
    queryFn: () => api.get('/providers').then((res) => res.data),
  });
