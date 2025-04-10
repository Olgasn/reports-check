import { createAppAsyncThunk, ICreateStudent, IUpdateStudent } from '@@types';
import { studentsApi } from '@api';

export const getStudents = createAppAsyncThunk('student/getStudents', async () => {
  const students = await studentsApi.getStudents();

  return students;
});

export const getStudent = createAppAsyncThunk('student/getStudent', async (id: number) => {
  const student = await studentsApi.getStudent(id);

  return student;
});

export const createStudent = createAppAsyncThunk(
  'student/createStudent',
  async (data: ICreateStudent) => {
    const student = await studentsApi.createStudent(data);

    return student;
  }
);

export const updateStudent = createAppAsyncThunk(
  'student/updateStudent',
  async (payload: { id: number; data: IUpdateStudent }) => {
    const { id, data } = payload;
    const student = await studentsApi.updateStudent(id, data);

    return student;
  }
);

export const deleteStudent = createAppAsyncThunk('student/deleteStudent', async (id: number) => {
  await studentsApi.deleteStudent(id);

  return id;
});
