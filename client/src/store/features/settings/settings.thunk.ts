import { ApiKey, createAppAsyncThunk, ICreateModel, Model } from '@@types';
import { keysApi, modelsApi } from '@api';

export const getKeys = createAppAsyncThunk('/settings/getKeys', async () => {
  const result = await keysApi.findAll();

  return result;
});

export const editKey = createAppAsyncThunk('settings/editKey', async (data: ApiKey) => {
  const result = await keysApi.updateKey(data.id, data);

  return result;
});

export const deleteKey = createAppAsyncThunk('settings/deleteKey', async (id: number) => {
  await keysApi.deleteKey(id);

  return id;
});

export const createKey = createAppAsyncThunk(
  'settings/createKey',
  async (data: { name: string; value: string }) => {
    const result = await keysApi.createKey(data);

    return result;
  }
);

export const getModels = createAppAsyncThunk('/settings/getModels', async () => {
  const result = await modelsApi.findAll();

  return result;
});

export const editModel = createAppAsyncThunk('settings/editModel', async (data: Model) => {
  const result = await modelsApi.updateModel(data.id, data);

  return result;
});

export const createModel = createAppAsyncThunk('settings/addModel', async (data: ICreateModel) => {
  const result = await modelsApi.createModel(data);

  return result;
});

export const deleteModel = createAppAsyncThunk('settings/deleteModel', async (id: number) => {
  await modelsApi.deleteModel(id);

  return id;
});
