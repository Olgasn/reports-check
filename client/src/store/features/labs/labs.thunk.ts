import { createAppAsyncThunk, ICreateLab, IEditLab } from '@@types';
import { labsApi } from '@api';

export const getOneLab = createAppAsyncThunk('labs/getOneLab', async (labId: number) => {
  const lab = await labsApi.getOneLab(labId);

  return lab;
});

export const getCourseLabs = createAppAsyncThunk('labs/getByCourse', async (courseId: number) => {
  const labs = await labsApi.getCourseLabs(courseId);

  return { courseId, labs };
});

export const createLab = createAppAsyncThunk(
  'labs/createLab',
  async (payload: { courseId: number; data: ICreateLab }) => {
    const { data, courseId } = payload;
    const lab = await labsApi.createLab(data);

    return { courseId, lab };
  }
);

export const updateLab = createAppAsyncThunk(
  'labs/updateLab',
  async (payload: { id: number; data: IEditLab; courseId: number }) => {
    const { data, id, courseId } = payload;
    const lab = await labsApi.editLab(id, data);

    return { courseId, lab };
  }
);

export const deleteLab = createAppAsyncThunk(
  'labs/delteLab',
  async (data: { labId: number; courseId: number }) => {
    const { labId, courseId } = data;

    await labsApi.deleteLab(labId);

    return { labId, courseId };
  }
);
