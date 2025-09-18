import { FC } from 'react';

import { Box, Divider } from '@mui/material';

import { TextDiv, BoldSpan, RegularSpan } from './result-item.styled';
import { ResultItemProps } from './result-item.types';

export const ResultItem: FC<ResultItemProps> = ({
  grade,
  model,
  review,
  advantages,
  disadvantages,
  date,
}) => {
  const d = new Date(date);

  return (
    <Box display="flex" flexDirection="column">
      <Divider flexItem sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <TextDiv>
          <BoldSpan>Оценка:</BoldSpan> <RegularSpan>{grade}/10</RegularSpan>
        </TextDiv>
        <TextDiv>
          <BoldSpan>Модель:</BoldSpan> <RegularSpan>{model.name}</RegularSpan>
        </TextDiv>
        <TextDiv>
          <BoldSpan>Дата:</BoldSpan> <RegularSpan>{d.toLocaleString()}</RegularSpan>
        </TextDiv>
      </Box>

      <Divider flexItem sx={{ my: 2 }} />

      <TextDiv>
        <div>
          <BoldSpan>Отзыв</BoldSpan>
        </div>

        <Box sx={{ mt: 2 }}>
          <RegularSpan>{review}</RegularSpan>
        </Box>
      </TextDiv>

      <Divider flexItem sx={{ my: 2 }} />

      <TextDiv>
        <Box sx={{ mb: 2 }}>
          <BoldSpan>Положительные моменты</BoldSpan>
        </Box>

        {advantages.split('\n').map((adv, ind) => (
          <Box key={ind} sx={{ mt: 1 }}>
            <BoldSpan>{ind + 1}.</BoldSpan> <RegularSpan>{adv}</RegularSpan>
          </Box>
        ))}
      </TextDiv>

      <Divider flexItem sx={{ my: 2 }} />

      <TextDiv>
        <Box sx={{ mb: 2 }}>
          <BoldSpan>Недостатки и моменты, требующие доработки</BoldSpan>
        </Box>

        {disadvantages.split('\n').map((adv, ind) => (
          <Box key={ind} sx={{ mt: 1 }}>
            <BoldSpan>{ind + 1}.</BoldSpan> <RegularSpan>{adv}</RegularSpan>
          </Box>
        ))}
      </TextDiv>
    </Box>
  );
};
