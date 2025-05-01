import styled from 'styled-components';

export const CourseDivItems = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CourseLineDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;

  &:not(:first-child) {
    margin-top: 15px;
  }
`;

export const HeadDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
