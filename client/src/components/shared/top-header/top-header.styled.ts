import { COLORS, PARAMS } from '@constants';
import styled from 'styled-components';

export const HeaderText = styled.div`
  font-family: ${PARAMS.DEFAULT_FONT};
  color: ${COLORS.TEXT};
  font-weight: bold;
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
`;

export const SubText = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT_LIGHTER};
  font-size: ${PARAMS.MEDIUM_FONT_SIZE};
  margin-top: 10px;
`;
