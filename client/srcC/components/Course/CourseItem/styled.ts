import { COLORS } from '@constants';
import styled from 'styled-components';

export const CourseItemDiv = styled.div`
  width: 350px;
  height: 200px;
  background-color: white;
  padding: 20px 25px;
  border-radius: 10px;

  &:not(:first-child) {
    margin-left: 15px;
  }

  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

export const CourseHeader = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT};
  font-weight: bold;
  font-size: 16px;
`;

export const CourseHeaderDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const CourseDescription = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT_LIGHTER};
  font-size: 14px;
  margin-top: 10px;
`;
