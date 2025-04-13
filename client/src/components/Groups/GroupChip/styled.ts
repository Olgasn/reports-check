import { COLORS } from '@constants';
import { darken } from 'polished';
import styled, { css } from 'styled-components';

interface GroupChipProps {
  isActive?: boolean;
}

export const GroupChipDiv = styled.div<GroupChipProps>`
  ${({ isActive = false }) => css`
    display: flex;
    flex-direction: row;
    border: 1px solid ${isActive ? darken(0.2, COLORS.LIGHT_BG) : COLORS.LIGHT_BG};
    background-color: ${isActive ? darken(0.2, COLORS.LIGHT_BG) : COLORS.LIGHT_BG};
    border-radius: 6px;
    padding: 0px 10px;
    height: 25px;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in;

    &:hover {
      cursor: pointer;
      border: 1px solid ${isActive ? COLORS.LIGHT_BG : darken(0.2, COLORS.LIGHT_BG)};
      background-color: ${isActive ? COLORS.LIGHT_BG : darken(0.2, COLORS.LIGHT_BG)};
    }

    &:not(:first-child) {
      margin-left: 5px;
    }
  `}
`;

export interface ChipTextProps {
  margin?: boolean;
}

export const GroupChipText = styled.div<ChipTextProps>`
  ${({ margin = true }) => css`
    font-family: 'Roboto';
    color: white;
    font-size: 13px;
    margin-right: ${margin ? '5px' : '0px'};
  `}
`;
