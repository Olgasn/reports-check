import { FC } from 'react';

import { Box, CircularProgress, Paper } from '@mui/material';

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Avatar } from '@shared';

import { CheckNotificationProps } from './check-notification.types';

export const CheckNotification: FC<CheckNotificationProps> = ({ student, status, model }) => {
  const getRightComponent = () => {
    switch (status) {
      case 'checked': {
        return <CheckCircleOutlineOutlinedIcon color="success" />;
      }

      case 'started': {
        return <CircularProgress color="primary" size="1.8rem" />;
      }

      case 'failed': {
        return <CancelOutlinedIcon color="error" />;
      }
    }
  };

  const rightComponent = getRightComponent();

  return (
    <Paper sx={{ px: 2, py: 1 }}>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Avatar text={student} additionalText={model} />

        {rightComponent}
      </Box>
    </Paper>
  );
};
