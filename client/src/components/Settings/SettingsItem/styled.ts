import { COLORS } from '@constants';
import styled from 'styled-components';

export const HeaderText = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT};
  font-weight: bold;
  font-size: 16px;
`;

export const SubText = styled.div`
  font-family: 'Roboto';
  color: ${COLORS.TEXT_LIGHTER};
  font-size: 14px;
  margin-top: 5px;
`;

export const SettingsTextDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
`;

export const SettingsItemDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
`;

export const SettingsChildren = styled.div`
  margin-left: 30px;
  flex-grow: 1;
`;

export const AddItemBtn = styled.div`
  font-family: 'Roboto';
  font-weight: bold;
  color: ${COLORS.TEXT};
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    cursor: pointer;
    color: ${COLORS.TEXT_LIGHTER};
  }
`;
