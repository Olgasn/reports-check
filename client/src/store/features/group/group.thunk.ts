import { createAppAsyncThunk, ICreateGroup, IUpdateGroup } from '@@types';
import { groupsApi } from '@api';

export const getGroups = createAppAsyncThunk('group/getGroups', async () => {
  const groups = await groupsApi.getGroups();

  return groups;
});

export const getGroup = createAppAsyncThunk('group/getGroup', async (id: number) => {
  const group = await groupsApi.getGroup(id);

  return group;
});

export const createGroup = createAppAsyncThunk('group/createGroup', async (data: ICreateGroup) => {
  const group = await groupsApi.createGroup(data);

  return group;
});

export const updateGroup = createAppAsyncThunk(
  'group/updateGroup',
  async (payload: { id: number; data: IUpdateGroup }) => {
    const { id, data } = payload;
    const group = await groupsApi.updateGroup(id, data);

    return group;
  }
);

export const deleteGroup = createAppAsyncThunk('group/deleteGroup', async (id: number) => {
  await groupsApi.deleteGroup(id);

  return id;
});
