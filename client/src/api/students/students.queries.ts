import { IStudent } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';
import { useQuery } from '@tanstack/react-query';

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

export const useGroupStudents = (groupId: number) =>
  useQuery<IStudent[]>({
    queryKey: [QUERY_KEYS.STUDENTS, groupId],
    queryFn: () => api.get(`/groups/${groupId}/students`).then((res) => res.data),
  });
