import { ICourse, Thunk, ThunkInit } from '@@types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createCourse,
  createPrompt,
  deleteCourse,
  editCourse,
  editPrompt,
  getCourse,
  getCourses,
} from './course.thunk';

interface State {
  addModalOpen: boolean;
  editModalOpen: boolean;
  courses: ICourse[];
  getCoursesThunk: Thunk;
  createCourseThunk: Thunk;
  editCourseThunk: Thunk;
  deleteCourseThunk: Thunk;
  findOneCourseThunk: Thunk;
  createPromptThunk: Thunk;
  editPromptThunk: Thunk;
  course: ICourse | null;
}

const state: State = {
  addModalOpen: false,
  editModalOpen: false,
  courses: [],
  course: null,
  getCoursesThunk: ThunkInit(),
  createCourseThunk: ThunkInit(),
  editCourseThunk: ThunkInit(),
  findOneCourseThunk: ThunkInit(),
  deleteCourseThunk: ThunkInit(),
  createPromptThunk: ThunkInit(),
  editPromptThunk: ThunkInit(),
};

export const courseSlice = createSlice({
  name: 'course',
  initialState: state,
  reducers: {
    setAddModal(state, action: PayloadAction<boolean>) {
      state.addModalOpen = action.payload;
    },
    setEditModal(state, action: PayloadAction<boolean>) {
      state.editModalOpen = action.payload;
    },
    setCourse(state, action: PayloadAction<ICourse | null>) {
      state.course = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPrompt.pending, (state) => {
        state.createPromptThunk.status = 'pending';
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.createPromptThunk.status = 'succeeded';

        const { prompt, courseId } = action.payload;

        const course = state.courses.find((c) => c.id === courseId);

        if (!course) {
          return;
        }

        course.prompt = prompt;
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.createPromptThunk.status = 'rejected';
        state.createPromptThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(editPrompt.pending, (state) => {
        state.editPromptThunk.status = 'pending';
      })
      .addCase(editPrompt.fulfilled, (state, action) => {
        state.editPromptThunk.status = 'succeeded';

        const { prompt, courseId } = action.payload;

        const course = state.courses.find((c) => c.id === courseId);

        if (!course) {
          return;
        }

        course.prompt = prompt;
      })
      .addCase(editPrompt.rejected, (state, action) => {
        state.editPromptThunk.status = 'rejected';
        state.editPromptThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(getCourse.pending, (state) => {
        state.findOneCourseThunk.status = 'pending';
      })
      .addCase(getCourse.fulfilled, (state, action) => {
        state.findOneCourseThunk.status = 'succeeded';

        const result = action.payload;

        state.courses.push(result);
      })
      .addCase(getCourse.rejected, (state, action) => {
        state.findOneCourseThunk.status = 'rejected';
        state.findOneCourseThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(getCourses.pending, (state) => {
        state.getCoursesThunk.status = 'pending';
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.getCoursesThunk.status = 'succeeded';

        const result = action.payload;

        state.courses = result;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.getCoursesThunk.status = 'rejected';
        state.getCoursesThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(createCourse.pending, (state) => {
        state.createCourseThunk.status = 'pending';
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.createCourseThunk.status = 'succeeded';

        const result = action.payload;

        state.courses.push(result);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.createCourseThunk.status = 'rejected';
        state.createCourseThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(editCourse.pending, (state) => {
        state.editCourseThunk.status = 'pending';
      })
      .addCase(editCourse.fulfilled, (state, action) => {
        state.editCourseThunk.status = 'succeeded';

        const result = action.payload;

        state.courses = state.courses.map((c) => (c.id === result.id ? result : c));
      })
      .addCase(editCourse.rejected, (state, action) => {
        state.editCourseThunk.status = 'rejected';
        state.editCourseThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(deleteCourse.pending, (state) => {
        state.deleteCourseThunk.status = 'pending';
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.deleteCourseThunk.status = 'succeeded';

        const result = action.payload;

        state.courses = state.courses.filter((c) => c.id !== result);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.deleteCourseThunk.status = 'rejected';
        state.deleteCourseThunk.error = action.error.message ?? 'Unknown Error';
      });
  },
});

export const { setAddModal, setEditModal, setCourse } = courseSlice.actions;
