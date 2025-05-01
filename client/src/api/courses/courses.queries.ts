import { ICourse } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';
import { useQuery } from '@tanstack/react-query';

export const useCourse = (id: number) =>
  useQuery<ICourse>({
    queryKey: [QUERY_KEYS.COURSES, id],
    queryFn: () => api.get(`/courses/${id}`).then((res) => res.data),
  });

export const useCourses = () =>
  useQuery<ICourse[]>({
    queryKey: [QUERY_KEYS.COURSES],
    queryFn: () => api.get('/courses').then((res) => res.data),
  });
