import { COLORS } from '@constants';
import styled from 'styled-components';

export const CheckInfoDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TextBold = styled.span`
  font-family: 'Roboto';
  font-size: 16px;
  color: ${COLORS.TEXT};
`;

export const TextRegular = styled.span`
  font-family: 'Roboto';
  font-size: 16px;
  color: ${COLORS.TEXT_LIGHTER};
  margin-top: 5px;
`;
