import { COLORS } from '@constants';
import styled from 'styled-components';

export const StudentHeadingDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 16px;
  font-family: 'Roboto';
`;

export const StudentHeadingText = styled.div`
  margin: 0px 10px;
`;

export const ResultsContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`;

export const CheckItemDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Roboto';
  color: ${COLORS.TEXT};
  justify-content: space-between;
`;

export const CheckItemSepDiv = styled.div`
  margin: 0px 10px;
`;

export const CheckGroupDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
