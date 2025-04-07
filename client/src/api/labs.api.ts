import { ICreateLab, IEditLab, ILab } from '@@types';
import { api } from './api';
import { prepareFormData } from '@utils';

export const getOneLab = async (labId: number) => {
  const response = await api.get<ILab>(`/labs/${labId}`);

  return response.data;
};

export const getCourseLabs = async (courseId: number) => {
  const response = await api.get<ILab[]>(`/courses/${courseId}/labs`);

  return response.data;
};

export const createLab = async (data: ICreateLab) => {
  const formData = prepareFormData(data);

  const response = await api.post<ILab>('/labs', formData, {
    headers: {
      'Content-Type': 'multipart-form-data',
    },
  });

  return response.data;
};

export const editLab = async (id: number, data: IEditLab) => {
  const formData = prepareFormData(data);

  const response = await api.patch<ILab>(`/labs/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart-form-data',
    },
  });

  return response.data;
};

export const deleteLab = async (id: number) => {
  await api.delete(`/labs/${id}`);
};
