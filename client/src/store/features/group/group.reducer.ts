import { IGroup, Thunk, ThunkInit } from '@@types';
import { createSlice } from '@reduxjs/toolkit';
import { createGroup, deleteGroup, getGroup, getGroups, updateGroup } from './group.thunk';

interface State {
  group: IGroup | null;
  groups: IGroup[];
  getGroupThunk: Thunk;
  getGroupsThunk: Thunk;
  createGroupThunk: Thunk;
  updateGroupThunk: Thunk;
  deleteGroupThunk: Thunk;
}

const state: State = {
  group: null,
  groups: [],
  getGroupThunk: ThunkInit(),
  getGroupsThunk: ThunkInit(),
  createGroupThunk: ThunkInit(),
  updateGroupThunk: ThunkInit(),
  deleteGroupThunk: ThunkInit(),
};

export const groupSlice = createSlice({
  name: 'group',
  initialState: state,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGroup.pending, (state) => {
        state.getGroupThunk.status = 'pending';
      })
      .addCase(getGroup.fulfilled, (state, action) => {
        state.getGroupThunk.status = 'succeeded';

        const result = action.payload;

        state.group = result;
      })
      .addCase(getGroup.rejected, (state, action) => {
        state.getGroupThunk.status = 'rejected';
        state.getGroupThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(getGroups.pending, (state) => {
        state.getGroupsThunk.status = 'pending';
      })
      .addCase(getGroups.fulfilled, (state, action) => {
        state.getGroupsThunk.status = 'succeeded';

        const result = action.payload;

        state.groups = result;
      })
      .addCase(getGroups.rejected, (state, action) => {
        state.getGroupsThunk.status = 'rejected';
        state.getGroupsThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(createGroup.pending, (state) => {
        state.createGroupThunk.status = 'pending';
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.createGroupThunk.status = 'succeeded';

        const result = action.payload;

        state.groups.push(result);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.createGroupThunk.status = 'rejected';
        state.createGroupThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(updateGroup.pending, (state) => {
        state.updateGroupThunk.status = 'pending';
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.updateGroupThunk.status = 'succeeded';

        const result = action.payload;

        state.groups = state.groups.map((gr) => (gr.id === result.id ? result : gr));
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.updateGroupThunk.status = 'rejected';
        state.updateGroupThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(deleteGroup.pending, (state) => {
        state.deleteGroupThunk.status = 'pending';
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.deleteGroupThunk.status = 'succeeded';

        const id = action.payload;

        state.groups = state.groups.filter((gr) => gr.id !== id);
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.deleteGroupThunk.status = 'rejected';
        state.deleteGroupThunk.error = action.error.message ?? 'Unknown Error';
      });
  },
});
