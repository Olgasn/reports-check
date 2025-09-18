import { IModel } from '@@types';
import { api } from '@api';
import { QUERY_KEYS } from '@constants';
import { useQuery } from '@tanstack/react-query';

export const useModels = () =>
  useQuery<IModel[]>({
    queryKey: [QUERY_KEYS.MODELS],
    queryFn: () => api.get('/models').then((res) => res.data),
  });
