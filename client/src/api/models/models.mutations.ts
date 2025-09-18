import { ICreateModel, IModel, IUpdateModel } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { useMutation } from '@tanstack/react-query';

export const useCreateModel = () =>
  useMutation<IModel, Error, ICreateModel>({
    mutationFn: (payload) => api.post('/models', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODELS] });
    },
  });

export const useUpdateModel = () =>
  useMutation<IModel, Error, { id: number; data: IUpdateModel }>({
    mutationFn: ({ id, data }) => api.patch(`/models/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODELS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODELS, variables.id] });
    },
  });

export const useDeleteModel = () =>
  useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/models/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODELS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODELS, id] });
    },
  });
