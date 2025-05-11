import { FC } from 'react';
import { StudentResultModalProps } from './student-result-modal.types';
import { Modal, ResultItem, TaskModal } from '@components';
import { Box, Button } from '@mui/material';
import { useModalControls } from '@hooks';

export const StudentResultModal: FC<StudentResultModalProps> = ({
  isOpen,
  onClose,
  data,
  studentStr,
}) => {
  const taskControls = useModalControls();

  console.log(data);

  const handleTaskOpen = () => {
    taskControls.handleOpen();
  };

  const modalBody = (
    <Box display="flex" flexDirection="column">
      <ResultItem {...data} />

      <Button variant="outlined" sx={{ mt: 2 }} onClick={handleTaskOpen}>
        Отчет
      </Button>

      <TaskModal
        isOpen={taskControls.open}
        onClose={taskControls.handleClose}
        title={`Результаты студента ${studentStr}`}
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
