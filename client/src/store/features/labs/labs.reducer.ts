import { ILab, Thunk, ThunkInit } from '@@types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createLab, deleteLab, getCourseLabs, getOneLab, updateLab } from './labs.thunk';

interface IState {
  addLabModal: boolean;
  editLabModel: boolean;
  labs: { courseId: number; labs: ILab[] }[];
  createLabThunk: Thunk;
  updateLabThunk: Thunk;
  deleteLabThunk: Thunk;
  getCourseLabsThunk: Thunk;
  findOneLabThunk: Thunk;
  lab: ILab | null;
  labFound: ILab | null;
}

const state: IState = {
  addLabModal: false,
  editLabModel: false,
  labs: [],
  createLabThunk: ThunkInit(),
  updateLabThunk: ThunkInit(),
  deleteLabThunk: ThunkInit(),
  getCourseLabsThunk: ThunkInit(),
  findOneLabThunk: ThunkInit(),
  lab: null,
  labFound: null,
};

export const labsSlice = createSlice({
  name: 'labs',
  initialState: state,
  reducers: {
    setAddLabModal(state, action: PayloadAction<boolean>) {
      state.addLabModal = action.payload;
    },
    setEditLabModal(state, action: PayloadAction<boolean>) {
      state.editLabModel = action.payload;
    },
    setLab(state, action: PayloadAction<ILab | null>) {
      state.lab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOneLab.pending, (state) => {
        state.findOneLabThunk.status = 'pending';
      })
      .addCase(getOneLab.fulfilled, (state, action) => {
        state.findOneLabThunk.status = 'succeeded';

        const lab = action.payload;

        state.labFound = lab;
      })
      .addCase(getOneLab.rejected, (state, action) => {
        state.findOneLabThunk.status = 'rejected';
        state.findOneLabThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(getCourseLabs.pending, (state) => {
        state.getCourseLabsThunk.status = 'pending';
      })
      .addCase(getCourseLabs.fulfilled, (state, action) => {
        state.getCourseLabsThunk.status = 'succeeded';

        const { labs, courseId } = action.payload;

        state.labs.push({ labs, courseId });
      })
      .addCase(getCourseLabs.rejected, (state, action) => {
        state.getCourseLabsThunk.status = 'rejected';
        state.getCourseLabsThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(createLab.pending, (state) => {
        state.createLabThunk.status = 'pending';
      })
      .addCase(createLab.fulfilled, (state, action) => {
        state.createLabThunk.status = 'succeeded';

        const { lab, courseId } = action.payload;

        const course = state.labs.find((l) => l.courseId === courseId);

        if (!course) {
          return;
        }

        course.labs.push(lab);
      })
      .addCase(createLab.rejected, (state, action) => {
        state.createLabThunk.status = 'rejected';
        state.createLabThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(updateLab.pending, (state) => {
        state.updateLabThunk.status = 'pending';
      })
      .addCase(updateLab.fulfilled, (state, action) => {
        state.updateLabThunk.status = 'succeeded';

        const { lab, courseId } = action.payload;

        const course = state.labs.find((l) => l.courseId === courseId);

        if (!course) {
          return;
        }

        course.labs = course.labs.map((l) => (l.id === lab.id ? lab : l));
      })
      .addCase(updateLab.rejected, (state, action) => {
        state.updateLabThunk.status = 'rejected';
        state.updateLabThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(deleteLab.pending, (state) => {
        state.deleteLabThunk.status = 'pending';
      })
      .addCase(deleteLab.fulfilled, (state, action) => {
        state.deleteLabThunk.status = 'succeeded';

        const { labId, courseId } = action.payload;

        const course = state.labs.find((l) => l.courseId === courseId);

        if (!course) {
          return;
        }

        course.labs = course.labs.filter((l) => l.id !== labId);
      })
      .addCase(deleteLab.rejected, (state, action) => {
        state.deleteLabThunk.status = 'rejected';
        state.deleteLabThunk.error = action.error.message ?? 'Unknown Error';
      });
  },
});

export const { setLab, setAddLabModal, setEditLabModal } = labsSlice.actions;
