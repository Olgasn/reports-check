import { ICreateProvider, IProvider } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { useMutation } from '@tanstack/react-query';

export const useCreateProvider = () =>
  useMutation<IProvider, Error, ICreateProvider>({
    mutationFn: (payload) => api.post('/providers', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROVIDERS] });
    },
  });

export const useUpdateProvider = () =>
  useMutation<IProvider, Error, { id: number; data: ICreateProvider }>({
    mutationFn: ({ id, data }) => api.patch(`/providers/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROVIDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROVIDERS, variables.id] });
    },
  });

export const useDeleteProvider = () =>
  useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/providers/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROVIDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROVIDERS, id] });
    },
  });
