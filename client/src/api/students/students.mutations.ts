import { useMutation } from '@tanstack/react-query';

import { ICreateStudent, IImportStudentsCsvData, IImportStudentsCsvResult, IStudent, IUpdateStudent } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { prepareFormData } from '@utils';

export const useCreateStudent = () =>
  useMutation<IStudent, Error, ICreateStudent>({
    mutationFn: (payload) => api.post('/students', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS] });
    },
  });

export const useUpdateStudent = () =>
  useMutation<IStudent, Error, { id: number; data: IUpdateStudent }>({
    mutationFn: ({ id, data }) => api.patch(`/students/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS, variables.id] });
    },
  });

export const useDeleteStudent = () =>
  useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/students/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS, id] });
    },
  });

export const useImportStudentsCsv = () =>
  useMutation<IImportStudentsCsvResult, Error, IImportStudentsCsvData>({
    mutationFn: (payload) => {
      const formData = prepareFormData(payload);

      return api
        .post('/students/import-csv', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
    },
  });
