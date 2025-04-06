import { createAppAsyncThunk, ICreateCourse, IEditCourse } from '@@types';
import { coursesApi } from '@api';

export const getCourses = createAppAsyncThunk('course/getCourses', async () => {
  const data = await coursesApi.getCourses();

  return data;
});

export const createCourse = createAppAsyncThunk(
  'course/createCourse',
  async (data: ICreateCourse) => {
    const course = await coursesApi.createCourse(data);

    return course;
  }
);

export const editCourse = createAppAsyncThunk(
  'course/editCourse',
  async (data: { id: number; data: IEditCourse }) => {
    const course = await coursesApi.editCourse(data.id, data.data);

    return course;
  }
);

export const deleteCourse = createAppAsyncThunk('course/deleteCourse', async (id: number) => {
  await coursesApi.deleteCourse(id);

  return id;
});
