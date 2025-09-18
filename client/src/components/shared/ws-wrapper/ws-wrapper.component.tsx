import { FC, PropsWithChildren, useEffect, useState } from 'react';

import { PARAMS } from '@constants';
import io, { Socket } from 'socket.io-client';

import { useCheckNotifications, useNotifications } from './hooks';

export const WsWrapper: FC<PropsWithChildren> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  useNotifications(socket);
  useCheckNotifications(socket);

  useEffect(() => {
    const socket = io(PARAMS.WS_URL);

    setSocket(socket);
  }, []);

  return children;
};
