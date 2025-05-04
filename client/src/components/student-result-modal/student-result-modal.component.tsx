import { FC } from 'react';
import { StudentResultModalProps } from './student-result-modal.types';
import { Box, Divider } from '@mui/material';
import { Modal } from '@components';
import { TextDiv, BoldSpan, RegularSpan } from './student-result-modal.styled';

export const StudentResultModal: FC<StudentResultModalProps> = ({
  isOpen,
  onClose,
  data,
  studentStr,
}) => {
  const date = new Date(data.date);

  const modalBody = (
    <Box display="flex" flexDirection="column">
      <Divider flexItem sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <TextDiv>
          <BoldSpan>Оценка:</BoldSpan> <RegularSpan>{data.grade}/10</RegularSpan>
        </TextDiv>
        <TextDiv>
          <BoldSpan>Модель:</BoldSpan> <RegularSpan>{data.model.name}</RegularSpan>
        </TextDiv>
        <TextDiv>
          <BoldSpan>Дата:</BoldSpan> <RegularSpan>{date.toLocaleString()}</RegularSpan>
        </TextDiv>
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      <TextDiv>
        <div>
          <BoldSpan>Отзыв</BoldSpan>
        </div>

        <Box sx={{ mt: 2 }}>
          <RegularSpan>{data.review}</RegularSpan>
        </Box>
      </TextDiv>

      <Divider flexItem sx={{ my: 2 }} />

      <TextDiv>
        <Box sx={{ mb: 2 }}>
          <BoldSpan>Положительные моменты</BoldSpan>
        </Box>

        {data.advantages.split('\n').map((adv, ind) => (
          <Box key={ind} sx={{ mt: 1 }}>
            <BoldSpan>{ind + 1}.</BoldSpan> <RegularSpan>{adv}</RegularSpan>
          </Box>
        ))}
      </TextDiv>

      <Divider flexItem sx={{ my: 2 }} />

      <TextDiv>
        <Box sx={{ mb: 2 }}>
          <BoldSpan>Отрицательные моменты</BoldSpan>
        </Box>

        {data.disadvantages.split('\n').map((adv, ind) => (
          <Box key={ind} sx={{ mt: 1 }}>
            <BoldSpan>{ind + 1}.</BoldSpan> <RegularSpan>{adv}</RegularSpan>
          </Box>
        ))}
      </TextDiv>
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
