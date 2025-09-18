import { useEffect } from 'react';

import { INotification } from '@@types';
import { addNotification, AppDispatch, RootState, setCheckStatus, setNotifications } from '@store';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';

import { EVENTS } from '../ws-wrapper.constants';

export const useNotifications = (socket?: Socket) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    socket?.on(EVENTS.REPORTS_CHECKED, (payload: unknown) => {
      const data: INotification = JSON.parse(String(payload));

      const notification = {
        text: 'Проверка выполнена',
        time: Date.now(),
        ids: data.ids,
        labId: data.labId,
      };

      dispatch(addNotification(notification));
      dispatch(setCheckStatus({ labId: data.labId, status: 'checked' }));

      localStorage.setItem('notifications', JSON.stringify([...notifications, notification]));

      toast.success('Отчеты были проверены, зайдите в уведомления');
    });
  }, [socket]);

  useEffect(() => {
    socket?.on(EVENTS.CHECK_FAILED, () => {
      toast.error('Не удалось проверить отчеты');
    });
  }, [socket]);

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
  }, []);
};
