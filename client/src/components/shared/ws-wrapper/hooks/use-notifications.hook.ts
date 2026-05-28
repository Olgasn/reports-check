import { useCallback, useEffect } from 'react';

import { INotification } from '@@types';
import { addNotification, AppDispatch, RootState, setCheckStatus, setNotifications } from '@store';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';

import { EVENTS } from '../ws-wrapper.constants';

export const useNotifications = (socket?: Socket) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications } = useSelector((state: RootState) => state.notifications);

  const handleReportsChecked = useCallback((payload: unknown) => {
    const data: INotification = JSON.parse(String(payload));

    const notification = {
      text: 'Проверка выполнена',
      time: Date.now(),
      ids: data.ids,
      labId: data.labId,
    };

    dispatch(addNotification(notification));
    dispatch(setCheckStatus({ labId: data.labId, status: 'checked' }));

    localStorage.setItem('notifications', JSON.stringify([notification, ...notifications]));

    toast.success('Отчеты были проверены, зайдите в уведомления');
  }, [dispatch, notifications]);

  const handleCheckFailed = useCallback(() => {
    toast.error('Не удалось проверить отчеты');
  }, []);

  useEffect(() => {
    socket?.on(EVENTS.REPORTS_CHECKED, handleReportsChecked);

    return () => {
      socket?.off(EVENTS.REPORTS_CHECKED, handleReportsChecked);
    };
  }, [handleReportsChecked, socket]);

  useEffect(() => {
    socket?.on(EVENTS.CHECK_FAILED, handleCheckFailed);

    return () => {
      socket?.off(EVENTS.CHECK_FAILED, handleCheckFailed);
    };
  }, [handleCheckFailed, socket]);

  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');

    if (!savedNotifications) {
      return;
    }

    try {
      const parsed: INotification[] = JSON.parse(savedNotifications);

      dispatch(setNotifications(parsed.sort((a, b) => b.time - a.time)));
    } catch (e) {
      console.error('Error parsing notifications:', e);
    }
  }, [dispatch]);
};
