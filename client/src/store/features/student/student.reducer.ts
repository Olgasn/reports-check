import { IStudent, Thunk, ThunkInit } from '@@types';
import { createSlice } from '@reduxjs/toolkit';
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudents,
  updateStudent,
} from './student.thunk';

interface State {
  student: IStudent | null;
  students: IStudent[];
  getStudentThunk: Thunk;
  getStudentsThunk: Thunk;
  createStudentThunk: Thunk;
  updateStudentThunk: Thunk;
  deleteStudentThunk: Thunk;
}

const state: State = {
  student: null,
  students: [],
  getStudentThunk: ThunkInit(),
  getStudentsThunk: ThunkInit(),
  createStudentThunk: ThunkInit(),
  updateStudentThunk: ThunkInit(),
  deleteStudentThunk: ThunkInit(),
};

export const studentSlice = createSlice({
  name: 'student',
  initialState: state,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStudent.pending, (state) => {
        state.getStudentThunk.status = 'pending';
      })
      .addCase(getStudent.fulfilled, (state, action) => {
        state.getStudentThunk.status = 'succeeded';

        const result = action.payload;

        state.student = result;
      })
      .addCase(getStudent.rejected, (state, action) => {
        state.getStudentThunk.status = 'rejected';
        state.getStudentThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(getStudents.pending, (state) => {
        state.getStudentsThunk.status = 'pending';
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.getStudentsThunk.status = 'succeeded';

        const result = action.payload;

        state.students = result;
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.getStudentsThunk.status = 'rejected';
        state.getStudentsThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(createStudent.pending, (state) => {
        state.createStudentThunk.status = 'pending';
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.createStudentThunk.status = 'succeeded';

        const result = action.payload;

        state.students.push(result);
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.createStudentThunk.status = 'rejected';
        state.createStudentThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(updateStudent.pending, (state) => {
        state.updateStudentThunk.status = 'pending';
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.updateStudentThunk.status = 'succeeded';

        const result = action.payload;

        state.students = state.students.map((st) => (st.id === result.id ? result : st));
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.updateStudentThunk.status = 'rejected';
        state.updateStudentThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(deleteStudent.pending, (state) => {
        state.deleteStudentThunk.status = 'pending';
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.deleteStudentThunk.status = 'succeeded';

        const id = action.payload;

        state.students = state.students.filter((st) => st.id !== id);
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.deleteStudentThunk.status = 'rejected';
        state.deleteStudentThunk.error = action.error.message ?? 'Unknown Error';
      });
  },
});
