import { COLORS, PARAMS } from '@constants';
import { lighten } from 'polished';
import styled from 'styled-components';

export const TextDiv = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
`;

export const BoldSpan = styled.span`
  font-weight: bold;
  color: ${COLORS.TEXT};
`;

export const RegularSpan = styled.span`
  color: ${lighten(0.1, COLORS.TEXT)};
`;
