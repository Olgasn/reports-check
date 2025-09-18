import { useQuery } from '@tanstack/react-query';

import { IPaginated, ISearchStudents, IStudent } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';

export const useStudent = (id: number) =>
  useQuery<IStudent>({
    queryKey: [QUERY_KEYS.STUDENTS, id],
    queryFn: () => api.get(`/students/${id}`).then((res) => res.data),
  });

export const useStudents = () =>
  useQuery<IStudent[]>({
    queryKey: [QUERY_KEYS.STUDENTS],
    queryFn: () => api.get('/students').then((res) => res.data),
  });

export const useGroupStudents = (pagination: ISearchStudents) =>
  useQuery<IPaginated<IStudent>>({
    queryKey: [QUERY_KEYS.STUDENTS, pagination],
    queryFn: () =>
      api.get(`/groups/search-students`, { params: pagination }).then((res) => res.data),
  });
