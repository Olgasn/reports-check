import { ICreateKey, IKey } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { useMutation } from '@tanstack/react-query';

export const useCreateKey = () =>
  useMutation<IKey, Error, ICreateKey>({
    mutationFn: (payload) => api.post('/keys', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KEYS] });
    },
  });

export const useUpdateKey = () =>
  useMutation<IKey, Error, { id: number; data: ICreateKey }>({
    mutationFn: ({ id, data }) => api.patch(`/keys/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KEYS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KEYS, variables.id] });
    },
  });

export const useDeleteKey = () =>
  useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/keys/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KEYS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KEYS, id] });
    },
  });
