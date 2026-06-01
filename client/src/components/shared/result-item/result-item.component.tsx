import { FC } from 'react';

import { Alert, Box, Divider } from '@mui/material';

import { TextDiv, BoldSpan, RegularSpan } from './result-item.styled';
import { ResultItemProps } from './result-item.types';

export const ResultItem: FC<ResultItemProps> = ({
  grade,
  model,
  review,
  advantages,
  disadvantages,
  date,
  promptInjectionDetected,
  promptInjectionRisk,
  promptInjectionFragments,
  securityComment,
}) => {
  const d = new Date(date);
  const fragments = promptInjectionFragments?.split('\n').filter(Boolean) ?? [];

  return (
    <Box display="flex" flexDirection="column">
      <Divider flexItem sx={{ mb: 2 }} />

      {promptInjectionDetected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Обнаружена возможная prompt-инъекция
          {promptInjectionRisk && `, риск: ${promptInjectionRisk}`}
          {securityComment && `. ${securityComment}`}
          {fragments.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {fragments.map((fragment, ind) => (
                <Box key={ind}>{fragment}</Box>
              ))}
            </Box>
          )}
        </Alert>
      )}

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
