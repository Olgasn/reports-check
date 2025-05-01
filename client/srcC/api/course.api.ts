import { ICourse, ICreateCourse, ICreatePrompt, IEditCourse, IEditPrompt, IPrompt } from '@@types';
import { api } from './api';

export const getCourses = async () => {
  const response = await api.get<ICourse[]>('/courses');

  return response.data;
};

export const createCourse = async (data: ICreateCourse) => {
  const response = await api.post<ICourse>('/courses', data);

  return response.data;
};

export const editCourse = async (id: number, data: IEditCourse) => {
  const response = await api.patch<ICourse>(`/courses/${id}`, data);

  return response.data;
};

export const deleteCourse = async (id: number) => {
  await api.delete(`/courses/${id}`);
};

export const findCourse = async (id: number) => {
  const response = await api.get<ICourse>(`/courses/${id}`);

  return response.data;
};

export const editPrompt = async (id: number, data: IEditPrompt) => {
  const response = await api.patch<IPrompt>(`/prompts/${id}`, data);

  return response.data;
};

export const createPrompt = async (data: ICreatePrompt) => {
  const response = await api.post<IPrompt>(`/prompts`, data);

  return response.data;
};
