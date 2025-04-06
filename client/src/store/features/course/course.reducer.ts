import { ICourse, Thunk, ThunkInit } from '@@types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createCourse, deleteCourse, editCourse, getCourses } from './course.thunk';

interface State {
  addModalOpen: boolean;
  editModalOpen: boolean;
  courses: ICourse[];
  getCoursesThunk: Thunk;
  createCourseThunk: Thunk;
  editCourseThunk: Thunk;
  deleteCourseThunk: Thunk;
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
  deleteCourseThunk: ThunkInit(),
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
