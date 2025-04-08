import { COLORS } from '@constants';
import styled, { css } from 'styled-components';

export const FormStyled = styled.form`
  display: flex;
  flex-direction: column;
`;

export const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const FormHeading = styled.div`
  font-family: 'Roboto';
  font-size: 18px;
  color: ${COLORS.TEXT};
  font-weight: bold;
`;

interface FormDescProps {
  margin?: boolean;
}

export const FormDesc = styled.div<FormDescProps>`
  ${({ margin }) => css`
    font-family: 'Roboto';
    font-size: 16px;
    color: ${COLORS.TEXT_LIGHTER};
    margin-top: 5px;
    margin-bottom: ${margin ? '0px' : '15px'};
  `}
`;

export const MidItem = styled.span`
  margin: 0px 20px;
`;

export const FormBtn = styled.button`
  background-color: ${COLORS.MENU_BG};
  color: white;
  font-family: 'Roboto';
  font-size: 16px;
  height: 40px;
  border-radius: 5px;
  border: 1px solid ${COLORS.MENU_BG};
`;

export const LoaderDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
`;

export const LoaderTextDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 15px;
`;

export const LabTaskWrapper = styled.div`
  background-color: white;
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const CheckResultsDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 15px;
`;
