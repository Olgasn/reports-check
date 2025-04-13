import { COLORS } from '@constants';
import { darken } from 'polished';
import styled from 'styled-components';

export const DataContainerDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const TextDiv = styled.div`
  font-family: 'Roboto';
  font-size: 15px;
`;

export const BoldSpan = styled.span`
  font-weight: bold;
  color: ${COLORS.TEXT};
`;

export const RegularSpan = styled.span`
  color: ${darken(0.1, COLORS.TEXT_LIGHTER)};
`;
