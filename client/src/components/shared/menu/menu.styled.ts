import { IconButton } from '@mui/material';

import { COLORS, PARAMS } from '@constants';
import { darken } from 'polished';
import styled, { css } from 'styled-components';

interface MenuProps {
  isOpen: boolean;
}

export const MenuStyled = styled.aside<MenuProps>`
  ${({ isOpen }) => css`
    background-color: ${COLORS.MENU_BG};
    display: flex;
    flex-direction: column;
    width: ${isOpen ? '330px' : '70px'};
    align-items: center;
    transition: all 0.2s ease;
    height: 100vh;
    overflow-y: auto;
    position: relative;
  `}
`;

export const NotificationsBtn = styled(IconButton)`
  font-family: ${PARAMS.DEFAULT_FONT};
  margin-left: ${PARAMS.MEDIUM_FONT_SIZE};
  height: 60px;
  color: ${darken(0.3, 'white')} !important;
`;
