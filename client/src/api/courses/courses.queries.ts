import { useQuery } from '@tanstack/react-query';

import { ICourse, ICoursePagination, ICourseSimple, IPaginated } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';

export const useCourse = (id: number) =>
  useQuery<ICourse>({
    queryKey: [QUERY_KEYS.COURSES, id],
    queryFn: () => api.get(`/courses/${id}`).then((res) => res.data),
  });

export const useCourses = (data: ICoursePagination) =>
  useQuery<IPaginated<ICourse>>({
    queryKey: [QUERY_KEYS.COURSES, data],
    queryFn: () => api.get('/courses', { params: data }).then((res) => res.data),
  });

export const useAllCourses = () =>
  useQuery<ICourseSimple[]>({
    queryKey: [QUERY_KEYS.COURSES_ALL],
    queryFn: () => api.get('/courses/all').then((res) => res.data),
  });
