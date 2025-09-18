import { useQuery } from '@tanstack/react-query';

import { ILab } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';

export const useLab = (id: number) =>
  useQuery<ILab>({
    queryKey: [QUERY_KEYS.LABS, id],
    queryFn: () => api.get(`/labs/${id}`).then((res) => res.data),
  });

export const useLabs = () =>
  useQuery<ILab[]>({
    queryKey: [QUERY_KEYS.LABS],
    queryFn: () => api.get('/labs').then((res) => res.data),
  });

export const useCourseLabs = (courseId: number) =>
  useQuery<ILab[]>({
    queryKey: [QUERY_KEYS.COURSE_LABS, courseId],
    queryFn: () => api.get(`/courses/${courseId}/labs`).then((res) => res.data),
  });
