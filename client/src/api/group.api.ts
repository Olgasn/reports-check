import { ICreateGroup, IGroup, IUpdateGroup } from '@@types';
import { api } from './api';

export const getGroup = async (id: number) => {
  const response = await api.get<IGroup>(`/groups/${id}`);

  return response.data;
};

export const getGroups = async () => {
  const response = await api.get<IGroup[]>('/groups');

  return response.data;
};

export const createGroup = async (data: ICreateGroup) => {
  const response = await api.post<IGroup>('/groups', data);

  return response.data;
};

export const updateGroup = async (id: number, data: IUpdateGroup) => {
  const response = await api.patch<IGroup>(`/groups/${id}`, data);

  return response.data;
};

export const deleteGroup = async (id: number) => {
  await api.delete(`/groups/${id}`);
};
