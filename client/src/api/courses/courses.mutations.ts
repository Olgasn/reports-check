import { ICourse, ICreateCourse } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { useMutation } from '@tanstack/react-query';

export const useCreateCourse = () =>
  useMutation<ICourse, Error, ICreateCourse>({
    mutationFn: (payload) => api.post('/courses', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
    },
  });

export const useUpdateCourse = () =>
  useMutation<ICourse, Error, { id: number; data: ICreateCourse }>({
    mutationFn: ({ id, data }) => api.patch(`/courses/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES, variables.id] });
    },
  });

export const useDeleteCourse = () =>
  useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/courses/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES, id] });
    },
  });
