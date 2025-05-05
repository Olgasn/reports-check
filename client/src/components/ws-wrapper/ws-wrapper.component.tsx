import { IWsCheckResult } from '@@types';
import { PARAMS } from '@constants';
import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { INotification } from './ws-wrapper.types';

const socket = io(PARAMS.WS_URL);

const WsContext = createContext<INotification[]>([]);

export const useNotifications = () => useContext(WsContext);

export const WsWrapper: FC<PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');

    if (!savedNotifications) {
      return;
    }

    try {
      const parsed = JSON.parse(savedNotifications);

      setNotifications(parsed);
    } catch (e) {
      console.error('Error parsing notifications:', e);
    }
  }, []);

  useEffect(() => {
    socket.on('report-processed', (payload) => {
      const { ids: data, status } = JSON.parse(payload) as IWsCheckResult;

      console.log(data, status);

      if (!data || status === 'error') {
        toast.error('Не удалось выполнить проверку отчетов');

        return;
      }

      const ids = data.map((item) => Number(item));

      setNotifications((prev) => {
        const newNots = [
          ...prev,
          {
            text: 'Проверка выполнена',
            time: Date.now(),
            ids,
          },
        ];

        localStorage.setItem('notifications', JSON.stringify(newNots));

        return newNots;
      });

      toast.success('Отчеты были проверены, зайдите в уведомления и перейдите по ссылке');
    });
  }, []);

  return <WsContext.Provider value={notifications}>{children}</WsContext.Provider>;
};
