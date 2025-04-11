import { COLORS } from '@constants';
import { darken } from 'polished';
import styled from 'styled-components';

export const GroupChipDiv = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px solid ${COLORS.LIGHT_BG};
  background-color: ${COLORS.LIGHT_BG};
  border-radius: 6px;
  padding: 0px 10px;
  height: 25px;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in;

  &:hover {
    cursor: pointer;
    border: 1px solid ${darken(0.2, COLORS.LIGHT_BG)};
    background-color: ${darken(0.2, COLORS.LIGHT_BG)};
  }

  &:not(:first-child) {
    margin-left: 5px;
  }
`;

export const GroupChipText = styled.div`
  font-family: 'Roboto';
  color: white;
  font-size: 13px;
  margin-right: 5px;
`;
