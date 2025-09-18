import { ICreatePrompt, IEditPrompt, IPrompt } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { useMutation } from '@tanstack/react-query';

export const useCreatePrompt = () =>
  useMutation<IPrompt, Error, ICreatePrompt>({
    mutationFn: (payload) => api.post('/prompts', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROMPTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
    },
  });

export const useUpdatePrompt = () =>
  useMutation<IPrompt, Error, { id: number; data: IEditPrompt }>({
    mutationFn: ({ id, data }) => api.patch(`/prompts/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROMPTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROMPTS, variables.id] });
    },
  });
