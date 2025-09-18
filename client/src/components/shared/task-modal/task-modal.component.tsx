import { FC } from 'react';

import { Box } from '@mui/material';

import { Modal } from '@shared';

import { TaskText } from './task-modal.styled';
import { TaskModalProps } from './task-modal.types';

export const TaskModal: FC<TaskModalProps> = ({ task, onClose, title, isOpen }) => {
  const modalBody = (
    <Box sx={{ overflow: 'auto', maxHeight: '80vh' }}>
      <TaskText>{task}</TaskText>
    </Box>
  );

  return (
    <Modal body={modalBody} open={isOpen} onClose={onClose} title={title} sx={{ width: '80vw' }} />
  );
};
