import { CheckStatusType, INotification, IReport } from '@@types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface INotificationsState {
  notifications: INotification[];
  checkNotifications: Record<string, IReport[]>;
  checkStatus: Record<number, CheckStatusType>;
}

const notificationState: INotificationsState = {
  notifications: [],
  checkStatus: {},
  checkNotifications: {},
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState: notificationState,
  reducers: {
    setCheckStatus(state, action: PayloadAction<{ labId: number; status: CheckStatusType }>) {
      const { labId, status } = action.payload;

      state.checkStatus[labId] = status;
    },

    addNotification(state, action: PayloadAction<INotification>) {
      state.notifications = [action.payload, ...state.notifications];
    },

    setNotifications(state, action: PayloadAction<INotification[]>) {
      state.notifications = action.payload;
    },

    addCheckNotification(state, action: PayloadAction<{ labId: number; check: IReport }>) {
      const { labId, check } = action.payload;

      const checks = state.checkNotifications[labId] ?? [];

      state.checkNotifications[labId] = [...checks, check];
    },

    cleanCheckNotifications(state, action: PayloadAction<{ labId: number }>) {
      const { labId } = action.payload;

      state.checkNotifications[labId] = [];
    },

    changeCheckNotification(state, action: PayloadAction<{ labId: number; check: IReport }>) {
      const { labId, check } = action.payload;
      const checks = state.checkNotifications[labId] ?? [];

      state.checkNotifications[labId] = checks.map((c) => (check.id === c.id ? check : c));
    },
  },
});

export const {
  setCheckStatus,
  addNotification,
  setNotifications,
  addCheckNotification,
  changeCheckNotification,
  cleanCheckNotifications,
} = notificationSlice.actions;
