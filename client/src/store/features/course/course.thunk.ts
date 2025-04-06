import {
  createAppAsyncThunk,
  ICreateCourse,
  ICreatePrompt,
  IEditCourse,
  IEditPrompt,
} from '@@types';
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

export const getCourse = createAppAsyncThunk('course/findOne', async (id: number) => {
  const course = await coursesApi.findCourse(id);

  return course;
});

export const createPrompt = createAppAsyncThunk(
  'course/createPrompt',
  async (data: { courseId: number; data: ICreatePrompt }) => {
    const prompt = await coursesApi.createPrompt(data.data);

    return { courseId: data.courseId, prompt };
  }
);

export const editPrompt = createAppAsyncThunk(
  'course/editPrompt',
  async (data: { courseId: number; id: number; data: IEditPrompt }) => {
    const prompt = await coursesApi.editPrompt(data.id, data.data);

    return { courseId: data.courseId, prompt };
  }
);
