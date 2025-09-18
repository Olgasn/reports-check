import { useMutation } from '@tanstack/react-query';

import { ICheck, ICheckData, IStudentParse, IStudentParsed, IStudentsParsed } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { prepareFormData } from '@utils';

export const useCheckReports = () =>
  useMutation<ICheck[], Error, ICheckData>({
    mutationFn: (payload) => {
      const formData = prepareFormData(payload);

      return api
        .post('/reports', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODELS] });
    },
  });

export const useStudentsParseFromArchive = () =>
  useMutation<IStudentParsed[], Error, IStudentParse>({
    mutationFn: (payload) => {
      const formData = prepareFormData(payload);

      return api
        .post<IStudentsParsed>('/reports/parse-from-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data.students);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODELS] });
    },
  });
