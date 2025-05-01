import { ICreateStudent, IStudent, IUpdateStudent } from '@@types';
import { api } from './api';

export const getStudent = async (id: number) => {
  const response = await api.get<IStudent>(`/students/${id}`);

  return response.data;
};

export const getStudents = async () => {
  const response = await api.get<IStudent[]>(`/students`);

  return response.data;
};

export const createStudent = async (data: ICreateStudent) => {
  const response = await api.post<IStudent>('/students', data);

  return response.data;
};

export const updateStudent = async (id: number, data: IUpdateStudent) => {
  const response = await api.patch<IStudent>(`/students/${id}`, data);

  return response.data;
};

export const deleteStudent = async (id: number) => {
  await api.delete(`/students/${id}`);
};

export const getGroupStudents = async (groupId: number) => {
  const response = await api.get<IStudent[]>(`/groups/${groupId}/students`);

  return response.data;
};
