import { ICreateModel, Model } from '@@types';
import { api } from './api';

export const createModel = async (data: ICreateModel) => {
  const response = await api.post<Model>('/models', data);

  return response.data;
};

export const updateModel = async (id: number, data: Model) => {
  const response = await api.patch<Model>(`/models/${id}`, data);

  return response.data;
};

export const deleteModel = async (id: number) => {
  await api.delete(`/models/${id}`);
};

export const findAll = async () => {
  const response = await api.get<Model[]>('/models');

  return response.data;
};
