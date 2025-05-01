import { ApiKey } from '@@types';
import { api } from './api';

export const createKey = async (data: { name: string; value: string }) => {
  const response = await api.post<ApiKey>('/keys', data);

  return response.data;
};

export const updateKey = async (id: number, data: ApiKey) => {
  const response = await api.patch<ApiKey>(`/keys/${id}`, data);

  return response.data;
};

export const deleteKey = async (id: number) => {
  await api.delete(`/keys/${id}`);
};

export const findAll = async () => {
  const response = await api.get<ApiKey[]>('/keys');

  return response.data;
};
