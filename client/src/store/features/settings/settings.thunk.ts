import { ApiKey, createAppAsyncThunk, Model } from '@@types';

export const editKey = createAppAsyncThunk('settings/editKey', (data: ApiKey) => {
  return data;
});

export const deleteKey = createAppAsyncThunk('settings/deleteKey', (id: number) => {
  return id;
});

export const createKey = createAppAsyncThunk(
  'settings/createKey',
  (data: { name: string; value: string }) => {
    return {
      id: Date.now(),
      ...data,
    };
  }
);

export const editModel = createAppAsyncThunk('settings/editModel', (data: Model) => {
  return data;
});

export const createModel = createAppAsyncThunk(
  'settings/addModel',
  (data: { name: string; value: string; key: ApiKey }) => {
    return {
      id: Date.now(),
      ...data,
    };
  }
);

export const deleteModel = createAppAsyncThunk('settings/deleteModel', (id: number) => {
  return id;
});
