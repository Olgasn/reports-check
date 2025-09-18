import { COLORS, PARAMS } from '@constants';
import { styled } from 'styled-components';

export const TaskText = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  font-size: ${PARAMS.SMALL_FONT_SIZE};
  color: ${COLORS.TEXT};
  max-width: 100%;
  white-space: pre-line;
`;
