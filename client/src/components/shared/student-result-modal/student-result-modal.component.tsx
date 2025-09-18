import { FC } from 'react';

import { Box, Button } from '@mui/material';

import { useModalControls } from '@hooks';
import { Avatar, CheckCopyBtn, Modal, ResultItem, TaskModal } from '@shared';

import { StudentResultModalProps } from './student-result-modal.types';

export const StudentResultModal: FC<StudentResultModalProps> = ({
  isOpen,
  onClose,
  data,
  studentStr,
}) => {
  const taskControls = useModalControls();
  const handleTaskOpen = () => {
    taskControls.handleOpen();
  };

  const modalBody = (
    <Box display="flex" flexDirection="column">
      <Box
        sx={{
          mb: 2,
        }}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
      >
        <Avatar text={studentStr} />

        <CheckCopyBtn {...data} studentStr={studentStr} />
      </Box>

      <ResultItem {...data} />

      <Button variant="outlined" sx={{ mt: 2 }} onClick={handleTaskOpen}>
        Отчет
      </Button>

      <TaskModal
        isOpen={taskControls.open}
        onClose={taskControls.handleClose}
        title={`Отчет студента ${studentStr}`}
        task={data.report}
      />
    </Box>
  );

  const modalTitle = `Результаты студента ${studentStr}`;

  return (
    <Modal
      body={modalBody}
      open={isOpen}
      onClose={onClose}
      title={modalTitle}
      sx={{
        width: '75vw',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    />
  );
};
