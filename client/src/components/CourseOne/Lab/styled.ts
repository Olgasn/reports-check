import { COLORS } from '@constants';
import styled from 'styled-components';

export const LabDiv = styled.div`
  background-color: white;
  padding: 20px 25px;
  border-radius: 10px;

  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);

  &:not(:first-child) {
    margin-top: 10px;
  }
`;

export const LabHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const LabHeaderText = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT};
  font-size: 18px;
  font-weight: bold;
`;

export const LabDesc = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT_LIGHTER};
  font-size: 16px;
  margin-top: 5px;
`;
