import { ICreateGroup, IGroup, IUpdateGroup } from '@@types';
import { api, queryClient } from '@api';
import { QUERY_KEYS } from '@constants';
import { useMutation } from '@tanstack/react-query';

export const useCreateGroup = () =>
  useMutation<IGroup, Error, ICreateGroup>({
    mutationFn: (payload) => api.post('/groups', payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
    },
  });

export const useUpdateGroup = () =>
  useMutation<IGroup, Error, { id: number; data: IUpdateGroup }>({
    mutationFn: ({ id, data }) => api.patch(`/groups/${id}`, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS, variables.id] });
    },
  });

export const useDeleteGroup = () =>
  useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`/groups/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS, id] });
    },
  });
