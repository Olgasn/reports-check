import { FC, useMemo, useState } from 'react';

import { Box, Button, Divider } from '@mui/material';

import { COLORS } from '@constants';
import { useModalControls } from '@hooks';
import { CheckModal, Modal } from '@shared';
import { RootState } from '@store';
import { useSelector } from 'react-redux';

import { NotText } from './notifications-modal.styled';
import { NotificationsModalProps } from './notifications-modal.types';

export const NotificationsModal: FC<NotificationsModalProps> = ({ isOpen, handleClose }) => {
  const [ids, setIds] = useState<null | number[]>(null);

  const checkControls = useModalControls();

  const { notifications } = useSelector((state: RootState) => state.notifications);

  const handleCheckClose = () => {
    setIds(null);

    checkControls.handleClose();
  };

  const body = useMemo(
    () => (
      <Box display="flex" flexDirection="column">
        <Divider flexItem sx={{ mb: 2 }} />

        {notifications.map(({ text, time, ids }, index) => {
          const date = new Date(time);

          const handleClick = () => {
            setIds(ids);

            checkControls.handleOpen();
          };

          return (
            <>
              <Box display="flex" flexDirection="row" alignItems="center">
                <NotText>{date.toLocaleString()}</NotText>
                <Box sx={{ mx: 1 }}>
                  <NotText>{text}</NotText>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ background: COLORS.SECONDARY, ml: 2 }}
                  onClick={handleClick}
                >
                  Перейти
                </Button>
              </Box>
              {index + 1 !== notifications.length && <Divider flexItem sx={{ my: 2 }} />}
            </>
          );
        })}
      </Box>
    ),
    [notifications]
  );

  return (
    <>
      <Modal
        body={body}
        open={isOpen}
        onClose={handleClose}
        title="Уведомления"
        sx={{
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      />

      {ids && <CheckModal isOpen={checkControls.open} onClose={handleCheckClose} ids={ids} />}
    </>
  );
};
