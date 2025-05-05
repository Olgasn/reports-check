import { FC } from 'react';
import { StudentResultModalProps } from './student-result-modal.types';
import { Modal, ResultItem } from '@components';

export const StudentResultModal: FC<StudentResultModalProps> = ({
  isOpen,
  onClose,
  data,
  studentStr,
}) => {
  const modalBody = <ResultItem {...data} />;

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
