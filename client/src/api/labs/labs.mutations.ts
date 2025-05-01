import { ICreateLab, IEditLab, ILab } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { useMutation } from '@tanstack/react-query';

export const useCreateLab = () =>
  useMutation<ILab, Error, ICreateLab>({
    mutationFn: (payload) => api.post('/labs', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LABS] });
    },
  });

export const useUpdateLab = () =>
  useMutation<ILab, Error, { id: number; data: IEditLab }>({
    mutationFn: ({ id, data }) => api.patch(`/labs/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LABS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LABS, variables.id] });
    },
  });

export const useDeleteLab = () =>
  useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/labs/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LABS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LABS, id] });
    },
  });
