import { COLORS } from '@constants';
import styled from 'styled-components';

export const HeaderText = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT};
  font-weight: bold;
  font-size: 25px;
`;

export const SubText = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT_LIGHTER};
  font-size: 18px;
  margin-top: 5px;
`;
