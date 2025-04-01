import { ApiKey, Model, Thunk, ThunkInit } from '@@types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createKey,
  createModel,
  deleteKey,
  deleteModel,
  editKey,
  editModel,
  getKeys,
  getModels,
} from './settings.thunk';

interface State {
  keys: ApiKey[];
  models: Model[];
  keysModalOpen: boolean;
  keysAddModalOpen: boolean;
  modelsModalOpen: boolean;
  addModelsModalOpen: boolean;
  getKeysThunk: Thunk;
  getModelsThunk: Thunk;
  createKeyThunk: Thunk;
  deleteKeyThunk: Thunk;
  editKeyThunk: Thunk;
  createModelThunk: Thunk;
  deleteModelThunk: Thunk;
  editModelThunk: Thunk;
}

const state: State = {
  keysAddModalOpen: false,
  addModelsModalOpen: false,
  getKeysThunk: ThunkInit(),
  getModelsThunk: ThunkInit(),
  createKeyThunk: ThunkInit(),
  deleteKeyThunk: ThunkInit(),
  editKeyThunk: ThunkInit(),
  createModelThunk: ThunkInit(),
  deleteModelThunk: ThunkInit(),
  editModelThunk: ThunkInit(),
  keysModalOpen: false,
  modelsModalOpen: false,
  keys: [],
  models: [],
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: state,
  reducers: {
    setKeysModal(state, action: PayloadAction<boolean>) {
      state.keysModalOpen = action.payload;
    },
    setAddKeysModal(state, action: PayloadAction<boolean>) {
      state.keysAddModalOpen = action.payload;
    },
    setModelsModal(state, action: PayloadAction<boolean>) {
      state.modelsModalOpen = action.payload;
    },
    setAddModelsModal(state, action: PayloadAction<boolean>) {
      state.addModelsModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getKeys.pending, (state) => {
        state.getKeysThunk.status = 'pending';
      })
      .addCase(getKeys.fulfilled, (state, action) => {
        state.getKeysThunk.status = 'succeeded';

        const result = action.payload;

        state.keys = result;
      })
      .addCase(getKeys.rejected, (state, action) => {
        state.getKeysThunk.status = 'rejected';
        state.getKeysThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(getModels.pending, (state) => {
        state.getModelsThunk.status = 'pending';
      })
      .addCase(getModels.fulfilled, (state, action) => {
        state.getModelsThunk.status = 'succeeded';

        const result = action.payload;

        state.models = result;
      })
      .addCase(getModels.rejected, (state, action) => {
        state.getModelsThunk.status = 'rejected';
        state.getModelsThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(createKey.pending, (state) => {
        state.createKeyThunk.status = 'pending';
      })
      .addCase(createKey.fulfilled, (state, action) => {
        state.createKeyThunk.status = 'succeeded';

        const result = action.payload;

        state.keys.push(result);
      })
      .addCase(createKey.rejected, (state, action) => {
        state.createKeyThunk.status = 'rejected';
        state.createKeyThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(editKey.pending, (state) => {
        state.editKeyThunk.status = 'pending';
      })
      .addCase(editKey.fulfilled, (state, action) => {
        state.editKeyThunk.status = 'succeeded';

        const result = action.payload;

        state.keys = state.keys.map((key) => (key.id === result.id ? result : key));
      })
      .addCase(editKey.rejected, (state, action) => {
        state.editKeyThunk.status = 'rejected';
        state.editKeyThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(deleteKey.pending, (state) => {
        state.deleteKeyThunk.status = 'pending';
      })
      .addCase(deleteKey.fulfilled, (state, action) => {
        state.deleteKeyThunk.status = 'succeeded';

        const result = action.payload;

        state.keys = state.keys.filter((key) => key.id !== result);
      })
      .addCase(deleteKey.rejected, (state, action) => {
        state.deleteKeyThunk.status = 'rejected';
        state.deleteKeyThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(createModel.pending, (state) => {
        state.createModelThunk.status = 'pending';
      })
      .addCase(createModel.fulfilled, (state, action) => {
        state.createModelThunk.status = 'succeeded';

        const result = action.payload;

        state.models.push(result);
      })
      .addCase(createModel.rejected, (state, action) => {
        state.createModelThunk.status = 'rejected';
        state.createModelThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(editModel.pending, (state) => {
        state.editModelThunk.status = 'pending';
      })
      .addCase(editModel.fulfilled, (state, action) => {
        state.editModelThunk.status = 'succeeded';

        const result = action.payload;

        state.models = state.models.map((key) => (key.id === result.id ? result : key));
      })
      .addCase(editModel.rejected, (state, action) => {
        state.editModelThunk.status = 'rejected';
        state.editModelThunk.error = action.error.message ?? 'Unknown Error';
      })

      .addCase(deleteModel.pending, (state) => {
        state.deleteModelThunk.status = 'pending';
      })
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.deleteModelThunk.status = 'succeeded';

        const result = action.payload;

        state.models = state.models.filter((key) => key.id !== result);
      })
      .addCase(deleteModel.rejected, (state, action) => {
        state.deleteModelThunk.status = 'rejected';
        state.deleteModelThunk.error = action.error.message ?? 'Unknown Error';
      });
  },
});

export const { setKeysModal, setAddKeysModal, setModelsModal, setAddModelsModal } =
  settingsSlice.actions;
