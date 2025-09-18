import { useMutation } from '@tanstack/react-query';

import { ICreateLab, IEditLab, ILab } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { prepareFormData } from '@utils';

export const useCreateLab = () =>
  useMutation<ILab, Error, ICreateLab>({
    mutationFn: (payload) => {
      const data = prepareFormData(payload);

      return api
        .post('/labs', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSE_LABS, payload.courseId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LABS] });
    },
  });

export const useUpdateLab = () =>
  useMutation<ILab, Error, { id: number; data: IEditLab }>({
    mutationFn: ({ id, data }) => {
      const payload = prepareFormData(data);

      return api
        .patch(`/labs/${id}`, payload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    },
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
