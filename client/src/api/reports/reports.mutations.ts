import { ICheck, ICheckData } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { useMutation } from '@tanstack/react-query';
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
