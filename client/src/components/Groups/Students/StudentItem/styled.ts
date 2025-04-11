import { COLORS } from '@constants';
import styled from 'styled-components';

export const StudentItemDiv = styled.div`
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  background-color: white;
  border: 1px solid white;
  border-radius: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;

  &:not(:first-child) {
    margin-top: 10px;
  }
`;

export const StudentAvatarDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const StudentName = styled.div`
  font-family: 'Roboto';
  font-size: 16px;
  color: ${COLORS.TEXT};
  margin-left: 10px;
`;
