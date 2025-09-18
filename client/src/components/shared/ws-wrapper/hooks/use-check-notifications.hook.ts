import { useEffect } from 'react';

import { IReport, IReportFailed } from '@@types';
import {
  addCheckNotification,
  AppDispatch,
  changeCheckNotification,
  cleanCheckNotifications,
  setCheckStatus,
} from '@store';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';

import { EVENTS } from '../ws-wrapper.constants';

export const useCheckNotifications = (socket?: Socket) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleCheckStatusChange = (check: unknown) => {
    const data: IReport = JSON.parse(String(check));

    dispatch(changeCheckNotification({ labId: data.labId, check: data }));
  };

  useEffect(() => {
    socket?.on(EVENTS.REPORT_ONE_STARTED, (payload: unknown) => {
      const data: IReport = JSON.parse(String(payload));

      dispatch(addCheckNotification({ labId: data.labId, check: data }));
    });
  }, [socket]);

  useEffect(() => {
    socket?.on(EVENTS.REPORT_ONE_SUCCESS, handleCheckStatusChange);
  }, [socket]);

  useEffect(() => {
    socket?.on(EVENTS.REPORT_ONE_FAILED, handleCheckStatusChange);
  }, [socket]);

  useEffect(() => {
    socket?.on(EVENTS.CHECK_FAILED, (payload: unknown) => {
      const data: IReportFailed = JSON.parse(String(payload));

      dispatch(cleanCheckNotifications(data));
      dispatch(setCheckStatus({ labId: data.labId, status: 'failed' }));

      toast.error(data.reason, { autoClose: false });
    });
  }, [socket]);
};
