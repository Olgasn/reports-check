import { COLORS } from '@constants';
import styled from 'styled-components';

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
`;

export const InputDiv = styled.div`
  display: flex;
  flex-direction: column;

  &:not(:first-child) {
    margin-top: 10px;
  }
`;

export const HeadingText = styled.div`
  color: ${COLORS.TEXT};
  font-family: 'Roboto';
  font-size: 17px;
  font-weight: bold;
`;

export const ModalBtn = styled.button`
  font-family: 'Roboto';
  font-size: 16px;
  height: 40px;
  background-color: ${COLORS.SECONDARY};
  color: white;
  padding: 5px 20px;
  border-radius: 5px;
`;

export const ErrorDiv = styled.div`
  color: red;
  font-family: 'Roboto';
  font-size: 16px;
  margin-top: 5px;
`;
